import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { ICreateGearPayload, IGearQuery, IUpdateGearPayload } from "./gear.interface";

const getAllGear = async (query: IGearQuery) => {
    const limit = query.limit ? Number(query.limit) : 10;
    const page = query.page ? Number(query.page) : 1;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy ? query.sortBy : "createdAt";
    const sortOrder = query.sortOrder ? query.sortOrder : "desc";

    const andConditions: Prisma.GearItemWhereInput[] = [];

    if (query.searchTerm) {
        andConditions.push({
            OR: [
                { name: { contains: query.searchTerm, mode: "insensitive" } },
                { description: { contains: query.searchTerm, mode: "insensitive" } },
                { brand: { contains: query.searchTerm, mode: "insensitive" } }
            ]
        });
    }

    if (query.categoryId) {
        andConditions.push({ categoryId: query.categoryId });
    }

    if (query.brand) {
        andConditions.push({ brand: { contains: query.brand, mode: "insensitive" } });
    }

    if (query.minPrice || query.maxPrice) {
        const priceFilter: Prisma.FloatFilter = {};
        if (query.minPrice) priceFilter.gte = Number(query.minPrice);
        if (query.maxPrice) priceFilter.lte = Number(query.maxPrice);
        andConditions.push({ pricePerDay: priceFilter });
    }

    andConditions.push({ isAvailable: true });

    const gearItems = await prisma.gearItem.findMany({
        where: { AND: andConditions },
        take: limit,
        skip,
        orderBy: { [sortBy]: sortOrder },
        include: {
            category: true,
            provider: {
                omit: { password: true }
            }
        }
    });

    const totalCount = await prisma.gearItem.count({
        where: { AND: andConditions }
    });

    return {
        data: gearItems,
        meta: {
            page,
            limit,
            total: totalCount,
            totalPages: Math.ceil(totalCount / limit)
        }
    };
}

const getGearById = async (gearId: string) => {
    const gearItem = await prisma.gearItem.findUniqueOrThrow({
        where: { id: gearId },
        include: {
            category: true,
            provider: {
                omit: { password: true }
            },
            reviews: {
                include: {
                    customer: {
                        omit: { password: true }
                    }
                },
                orderBy: { createdAt: "desc" }
            }
        }
    });

    return gearItem;
}

export const gearService = {
    getAllGear,
    getGearById
}
