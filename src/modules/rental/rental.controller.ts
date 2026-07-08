import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { rentalService } from "./rental.service";

const createRental = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user?.id as string;
    const result = await rentalService.createRental(customerId, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Rental order placed successfully",
        data: result
    });
});

const getMyRentals = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user?.id as string;
    const result = await rentalService.getMyRentals(customerId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental orders retrieved successfully",
        data: result
    });
});

const getRentalById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const customerId = req.user?.id as string;
    const id = req.params.id as string;
    const result = await rentalService.getRentalById(id, customerId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental order retrieved successfully",
        data: result
    });
});

export const rentalController = {
    createRental,
    getMyRentals,
    getRentalById
}
