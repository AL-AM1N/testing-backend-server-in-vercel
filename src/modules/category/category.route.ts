import { Router } from "express";
import { categoryController } from "./category.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";


const router = Router();

router.get("/", categoryController.getAllCategories);
router.post("/", auth(Role.ADMIN, Role.PROVIDER), categoryController.createCategory);

export const categoryRoutes = router;
