import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { providerService } from "./provider.service";

const addGearItem = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.user?.id as string;
    const result = await providerService.addGearItem(providerId, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Gear item added successfully",
        data: result
    });
});

const updateGearItem = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.user?.id as string;
    const id = req.params.id as string;
    const result = await providerService.updateGearItem(id, providerId, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Gear item updated successfully",
        data: result
    });
});

const deleteGearItem = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.user?.id as string;
    const id = req.params.id as string;
    await providerService.deleteGearItem(id, providerId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Gear item deleted successfully",
        data: null
    });
});

const getMyGearItems = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.user?.id as string;
    const result = await providerService.getMyGearItems(providerId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Gear items retrieved successfully",
        data: result
    });
});

const getIncomingOrders = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.user?.id as string;
    const result = await providerService.getIncomingOrders(providerId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Incoming orders retrieved successfully",
        data: result
    });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.user?.id as string;
    const id = req.params.id as string;
    const { status } = req.body;
    const result = await providerService.updateOrderStatus(id, providerId, status);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Order status updated successfully",
        data: result
    });
});

export const providerController = {
    addGearItem,
    updateGearItem,
    deleteGearItem,
    getMyGearItems,
    getIncomingOrders,
    updateOrderStatus
}
