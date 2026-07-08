import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { rentalController } from "./rental.controller";

const router = Router();

router.post("/", auth(Role.CUSTOMER), rentalController.createRental);

router.get("/", auth(Role.CUSTOMER), rentalController.getMyRentals);

router.get("/:id", auth(Role.CUSTOMER), rentalController.getRentalById);

export const rentalRoutes = router;
