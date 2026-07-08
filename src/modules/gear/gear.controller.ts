import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { gearService } from "./gear.service";

const getAllGear = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const query = req.query;
    const result = await gearService.getAllGear(query);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Gear items retrieved successfully",
        data: result.data,
        meta: result.meta
    });
});

const getGearById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const result = await gearService.getGearById(id);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Gear item retrieved successfully",
        data: result
    });
});

export const gearController = {
    getAllGear,
    getGearById
}
