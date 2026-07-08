import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { adminService } from "./admin.service";

const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await adminService.getAllUsers();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Users retrieved successfully",
        data: result
    });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const { status } = req.body;
    const result = await adminService.updateUserStatus(id, status);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "User status updated successfully",
        data: result
    });
});

const getAllGear = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await adminService.getAllGear();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Gear items retrieved successfully",
        data: result
    });
});

const getAllRentals = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await adminService.getAllRentals();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Rental orders retrieved successfully",
        data: result
    });
});

export const adminController = {
    getAllUsers,
    updateUserStatus,
    getAllGear,
    getAllRentals
}
