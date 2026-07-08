import { prisma } from "../../lib/prisma";

const getAllUsers = async () => {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        omit: { password: true },
        include: {
            _count: {
                select: {
                    providedGear: true,
                    rentals: true
                }
            }
        }
    });

    return users;
}

const updateUserStatus = async (userId: string, status: "ACTIVE" | "BLOCKED") => {
    const user = await prisma.user.findUniqueOrThrow({
        where: { id: userId }
    });

    if (user.role === "ADMIN") {
        throw new Error("Cannot change status of admin users");
    }

    const updated = await prisma.user.update({
        where: { id: userId },
        data: { status },
        omit: { password: true }
    });

    return updated;
}

const getAllGear = async () => {
    const gearItems = await prisma.gearItem.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            category: true,
            provider: {
                omit: { password: true }
            },
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

const getAllRentals = async () => {
    const rentals = await prisma.rentalOrder.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            gearItem: {
                include: {
                    category: true
                }
            },
            customer: {
                omit: { password: true }
            },
            payment: true
        }
    });

    return rentals;
}

export const adminService = {
    getAllUsers,
    updateUserStatus,
    getAllGear,
    getAllRentals
}
