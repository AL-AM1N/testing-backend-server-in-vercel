import { prisma } from "../../lib/prisma";
import { ICreateRentalPayload } from "./rental.interface";

const createRental = async (customerId: string, payload: ICreateRentalPayload) => {
    const { gearItemId, quantity, startDate, endDate } = payload;

    const gearItem = await prisma.gearItem.findUniqueOrThrow({
        where: { id: gearItemId }
    });

    if (!gearItem.isAvailable) {
        throw new Error("This gear item is currently not available for rent");
    }

    if (gearItem.quantity < quantity) {
        throw new Error(`Only ${gearItem.quantity} units available for this gear item`);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
        throw new Error("End date must be after start date");
    }

    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const totalAmount = days * gearItem.pricePerDay * quantity;

    const rentalOrder = await prisma.rentalOrder.create({
        data: {
            customerId,
            gearItemId,
            quantity,
            startDate: start,
            endDate: end,
            totalAmount,
            status: "PLACED"
        },
        include: {
            gearItem: true,
            customer: {
                omit: { password: true }
            }
        }
    });

    return rentalOrder;
}

const getMyRentals = async (customerId: string) => {
    const rentals = await prisma.rentalOrder.findMany({
        where: { customerId },
        orderBy: { createdAt: "desc" },
        include: {
            gearItem: {
                include: {
                    category: true
                }
            },
            payment: true
        }
    });

    return rentals;
}

const getRentalById = async (rentalId: string, customerId: string) => {
    const rental = await prisma.rentalOrder.findUniqueOrThrow({
        where: { id: rentalId, customerId },
        include: {
            gearItem: {
                include: {
                    category: true,
                    provider: {
                        omit: { password: true }
                    }
                }
            },
            payment: true
        }
    });

    return rental;
}

export const rentalService = {
    createRental,
    getMyRentals,
    getRentalById
}
