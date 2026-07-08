import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { paymentService } from "./payment.service";

const createPaymentIntent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;
    const result = await paymentService.createPaymentIntent(userId, req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Payment intent created successfully",
        data: result
    });
});

const confirmPayment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const result = await paymentService.confirmPayment(req.body);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Payment confirmed successfully",
        data: result
    });
});

const getMyPayments = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;
    const result = await paymentService.getMyPayments(userId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Payment history retrieved successfully",
        data: result
    });
});

const getPaymentById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id as string;
    const id = req.params.id as string;
    const result = await paymentService.getPaymentById(id, userId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Payment details retrieved successfully",
        data: result
    });
});

const handleWebhook = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const event = req.body as Buffer;
        const signature = req.headers['stripe-signature']!;

        await paymentService.handleWebhook(event, signature as string);

        sendResponse(res, {
            success: true,
            statusCode: 200,
            message: "Webhook triggered successfully",
            data: null
        })
    }
)

export const paymentController = {
    createPaymentIntent,
    confirmPayment,
    handleWebhook,
    getMyPayments,
    getPaymentById
}
