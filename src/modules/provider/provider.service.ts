import { prisma } from "../../lib/prisma";
import { ICreateGearPayload, IUpdateGearPayload } from "../gear/gear.interface";

const addGearItem = async (providerId: string, payload: ICreateGearPayload) => {
    const gearItem = await prisma.gearItem.create({
        data: {
            ...payload,
            providerId
        },
        include: {
            category: true
        }
    });

    return gearItem;
}

const updateGearItem = async (gearId: string, providerId: string, payload: IUpdateGearPayload) => {
    const gearItem = await prisma.gearItem.findUniqueOrThrow({
        where: { id: gearId }
    });

    if (gearItem.providerId !== providerId) {
        throw new Error("You can only update your own gear items");
    }

    const updated = await prisma.gearItem.update({
        where: { id: gearId },
        data: payload,
        include: {
            category: true
        }
    });

    return updated;
}

const deleteGearItem = async (gearId: string, providerId: string) => {
    const gearItem = await prisma.gearItem.findUniqueOrThrow({
        where: { id: gearId }
    });

    if (gearItem.providerId !== providerId) {
        throw new Error("You can only delete your own gear items");
    }

    await prisma.gearItem.delete({
        where: { id: gearId }
    });
}

const getMyGearItems = async (providerId: string) => {
    const gearItems = await prisma.gearItem.findMany({
        where: { providerId },
        orderBy: { createdAt: "desc" },
        include: {
            category: true,
            _count: {
                select: {
                    rentalOrders: true,
                    reviews: true
                }
            }
        }
    });

    return gearItems;
}

const getIncomingOrders = async (providerId: string) => {
    const orders = await prisma.rentalOrder.findMany({
        where: {
            gearItem: {
                providerId
            }
        },
        orderBy: { createdAt: "desc" },
        include: {
            gearItem: true,
            customer: {
                omit: { password: true }
            },
            payment: true
        }
    });

    return orders;
}

const updateOrderStatus = async (orderId: string, providerId: string, status: string) => {
    const order = await prisma.rentalOrder.findUniqueOrThrow({
        where: { id: orderId },
        include: {
            gearItem: true
        }
    });

    if (order.gearItem.providerId !== providerId) {
        throw new Error("You can only update orders for your own gear items");
    }

    const validTransitions: Record<string, string[]> = {
        "PLACED": ["CONFIRMED", "CANCELLED"],
        "CONFIRMED": ["PAID", "CANCELLED"],
        "PAID": ["PICKED_UP", "CANCELLED"],
        "PICKED_UP": ["RETURNED", "CANCELLED"],
    };

    const allowed = validTransitions[order.status];
    if (!allowed || !allowed.includes(status)) {
        throw new Error(`Cannot transition from ${order.status} to ${status}`);
    }

    if (status === "RETURNED" || status === "CANCELLED") {
        if (order.status === "PAID" || order.status === "PICKED_UP") {
            await prisma.gearItem.update({
                where: { id: order.gearItemId },
                data: { quantity: { increment: order.quantity } }
            });
        }
    }

    const updated = await prisma.rentalOrder.update({
        where: { id: orderId },
        data: { status: status as any },
        include: {
            gearItem: true,
            customer: {
                omit: { password: true }
            }
        }
    });

    return updated;
}

export const providerService = {
    addGearItem,
    updateGearItem,
    deleteGearItem,
    getMyGearItems,
    getIncomingOrders,
    updateOrderStatus
}
