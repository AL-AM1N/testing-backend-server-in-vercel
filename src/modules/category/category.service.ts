import { prisma } from "../../lib/prisma";
import { ICreateCategoryPayload } from "./category.interface";

const getAllCategories = async () => {
    const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
        include: {
            _count: {
                select: { gearItems: true }
            }
        }
    });

    return categories;
}

const createCategory = async (payload: ICreateCategoryPayload) => {
    const category = await prisma.category.create({
        data: {
            name: payload.name,
            description: payload.description
        }
    });

    return category;
}

export const categoryService = {
    getAllCategories,
    createCategory
}
