import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { providerController } from "./provider.controller";

const router = Router();

router.post("/gear", auth(Role.PROVIDER), providerController.addGearItem);

router.get("/gear", auth(Role.PROVIDER), providerController.getMyGearItems);

router.put("/gear/:id", auth(Role.PROVIDER), providerController.updateGearItem);

router.delete("/gear/:id", auth(Role.PROVIDER), providerController.deleteGearItem);

router.get("/orders", auth(Role.PROVIDER), providerController.getIncomingOrders);

router.patch("/orders/:id", auth(Role.PROVIDER), providerController.updateOrderStatus);

export const providerRoutes = router;
