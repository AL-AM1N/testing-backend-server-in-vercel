import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { paymentController } from "./payment.controller";

const router = Router();

router.post("/webhook", paymentController.handleWebhook);

router.post("/create", auth(Role.CUSTOMER), paymentController.createPaymentIntent);

router.post("/confirm", auth(Role.CUSTOMER), paymentController.confirmPayment);

router.get("/", auth(Role.CUSTOMER), paymentController.getMyPayments);

router.get("/:id", auth(Role.CUSTOMER), paymentController.getPaymentById);

export const paymentRoutes = router;
