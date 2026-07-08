import { prisma } from "../../lib/prisma";

export const handlePaymentSuccess = async (rentalOrderId: string, transactionId: string, method: "STRIPE" | "SSLCOMMERZ") => {
    const payment = await prisma.payment.findUnique({
        where: { rentalOrderId }
    });

    if (!payment) {
        throw new Error("Payment record not found");
    }

    await prisma.payment.update({
        where: { rentalOrderId },
        data: {
            status: "COMPLETED",
            transactionId,
            paidAt: new Date()
        }
    });

    await prisma.rentalOrder.update({
        where: { id: rentalOrderId },
        data: { status: "PAID" }
    });
}
