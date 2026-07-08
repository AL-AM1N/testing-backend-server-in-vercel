import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { categoryService } from "./category.service";

const getAllCategories = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await categoryService.getAllCategories();

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Categories retrieved successfully",
        data: result
    });
});

const createCategory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await categoryService.createCategory(req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Category created successfully",
        data: result
    });
});

export const categoryController = {
    getAllCategories,
    createCategory
}
