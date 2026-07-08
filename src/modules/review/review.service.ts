import { prisma } from "../../lib/prisma";
import { ICreateReviewPayload } from "./review.interface";

const createReview = async (customerId: string, payload: ICreateReviewPayload) => {
    const { gearItemId, rating, comment } = payload;

    await prisma.gearItem.findUniqueOrThrow({
        where: { id: gearItemId }
    });

    const hasReturnedRental = await prisma.rentalOrder.findFirst({
        where: {
            customerId,
            gearItemId,
            status: "RETURNED"
        }
    });

    if (!hasReturnedRental) {
        throw new Error("You can only review gear items after returning them");
    }

    if (rating < 1 || rating > 5) {
        throw new Error("Rating must be between 1 and 5");
    }

    const existingReview = await prisma.review.findFirst({
        where: {
            customerId,
            gearItemId
        }
    });

    if (existingReview) {
        throw new Error("You have already reviewed this gear item");
    }

    const review = await prisma.review.create({
        data: {
            customerId,
            gearItemId,
            rating,
            comment
        },
        include: {
            customer: {
                omit: { password: true }
            }
        }
    });

    return review;
}

export const reviewService = {
    createReview
}
