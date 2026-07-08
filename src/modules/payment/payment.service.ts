import config from "../../config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { ICreatePaymentPayload } from "./payment.interface";

const createPaymentIntent = async (userId: string, payload: ICreatePaymentPayload) => {
    const { rentalOrderId, method } = payload;

    const rentalOrder = await prisma.rentalOrder.findUniqueOrThrow({
        where: { id: rentalOrderId, customerId: userId },
        include: { gearItem: true }
    });

    if (rentalOrder.status !== "PLACED" && rentalOrder.status !== "CONFIRMED") {
        throw new Error("Payment can only be made for placed or confirmed orders");
    }

    const existingPayment = await prisma.payment.findUnique({
        where: { rentalOrderId }
    });

    if (existingPayment?.status === "COMPLETED") {
        throw new Error("Payment has already been completed for this order");
    }

    let payment;
    if (existingPayment) {
        payment = existingPayment;
    } else {
        payment = await prisma.payment.create({
            data: {
                rentalOrderId,
                userId,
                amount: rentalOrder.totalAmount,
                method,
                status: "PENDING"
            }
        });
    }

    if (method === "STRIPE") {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(rentalOrder.totalAmount * 100),
            currency: "usd",
            metadata: {
                rentalOrderId,
                userId
            }
        });

        await prisma.payment.update({
            where: { id: payment.id },
            data: { stripePaymentIntentId: paymentIntent.id }
        });

        return {
            clientSecret: paymentIntent.client_secret,
            paymentId: payment.id,
            amount: rentalOrder.totalAmount
        };
    }

    return {
        paymentId: payment.id,
        amount: rentalOrder.totalAmount,
        message: "Payment record created. Complete payment via SSLCommerz."
    };
}

const confirmPayment = async (payload: { paymentIntentId: string; rentalOrderId: string }) => {

    // for confirm payment: stripe payment_intents confirm "clientSecret" --payment-method=pm_card_visa --return-url=http://localhost:5000

    const { paymentIntentId, rentalOrderId } = payload;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
        throw new Error("Payment has not been completed");
    }

    const rentalOrder = await prisma.rentalOrder.findUniqueOrThrow({
        where: { id: rentalOrderId },
        select: { gearItemId: true, quantity: true }
    });

    await prisma.$transaction(async (tx) => {
        await tx.payment.update({
            where: { rentalOrderId },
            data: {
                status: "COMPLETED",
                transactionId: paymentIntentId,
                paidAt: new Date()
            }
        });

        await tx.rentalOrder.update({
            where: { id: rentalOrderId },
            data: { status: "PAID" }
        });

        await tx.gearItem.update({
            where: { id: rentalOrder.gearItemId },
            data: { quantity: { decrement: rentalOrder.quantity } }
        });
    });

    return { success: true };
}

const getMyPayments = async (userId: string) => {
    const payments = await prisma.payment.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: {
            rentalOrder: {
                include: {
                    gearItem: true
                }
            }
        }
    });

    return payments;
}

const getPaymentById = async (paymentId: string, userId: string) => {
    const payment = await prisma.payment.findUniqueOrThrow({
        where: { id: paymentId, userId },
        include: {
            rentalOrder: {
                include: {
                    gearItem: {
                        include: {
                            category: true
                        }
                    }
                }
            }
        }
    });

    return payment;
}

const handleWebhook = async (payload: Buffer, signature: string) => {
    const endpointSecret = config.stripe_webhook_secret;

    if (!endpointSecret) {
        throw new Error("Stripe webhook secret is not configured");
    }

    const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        endpointSecret
    );

    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as any;
            const rentalOrderId = session.metadata?.rentalOrderId;
            const userId = session.metadata?.userId;

            if (!rentalOrderId || !userId) {
                console.log("Webhook: Missing metadata in checkout.session.completed");
                return;
            }

            const rentalOrder = await prisma.rentalOrder.findUniqueOrThrow({
                where: { id: rentalOrderId },
                select: { gearItemId: true, quantity: true }
            });

            await prisma.$transaction(async (tx) => {
                await tx.payment.update({
                    where: { rentalOrderId },
                    data: {
                        status: "COMPLETED",
                        transactionId: session.id,
                        paidAt: new Date()
                    }
                });

                await tx.rentalOrder.update({
                    where: { id: rentalOrderId },
                    data: { status: "PAID" }
                });

                await tx.gearItem.update({
                    where: { id: rentalOrder.gearItemId },
                    data: { quantity: { decrement: rentalOrder.quantity } }
                });
            });

            break;
        }

        case 'payment_intent.succeeded': {
            const paymentIntent = event.data.object as any;
            const rentalOrderId = paymentIntent.metadata?.rentalOrderId;
            const userId = paymentIntent.metadata?.userId;

            if (!rentalOrderId || !userId) {
                console.log("Webhook: Missing metadata in payment_intent.succeeded");
                return;
            }

            const payment = await prisma.payment.findUnique({
                where: { rentalOrderId }
            });

            if (!payment) {
                console.log("Webhook: No payment record found for rental order");
                return;
            }

            if (payment.status === "COMPLETED") {
                console.log("Webhook: Payment already completed");
                return;
            }

            const rentalOrder = await prisma.rentalOrder.findUniqueOrThrow({
                where: { id: rentalOrderId },
                select: { gearItemId: true, quantity: true }
            });

            await prisma.$transaction(async (tx) => {
                await tx.payment.update({
                    where: { rentalOrderId },
                    data: {
                        status: "COMPLETED",
                        transactionId: paymentIntent.id,
                        paidAt: new Date()
                    }
                });

                await tx.rentalOrder.update({
                    where: { id: rentalOrderId },
                    data: { status: "PAID" }
                });

                await tx.gearItem.update({
                    where: { id: rentalOrder.gearItemId },
                    data: { quantity: { decrement: rentalOrder.quantity } }
                });
            });

            break;
        }

        default:
            console.log(`Webhook: Unhandled event type ${event.type}`);
            break;
    }
}

export const paymentService = {
    createPaymentIntent,
    confirmPayment,
    handleWebhook,
    getMyPayments,
    getPaymentById
}
