import { Router } from "express";
import ctrlWrapper from "../utils/ctrlWrapper.js";
import { validateBody } from "../middlewares/validateBody.js";
import { registerController, loginController, refreshController, logoutController } from "../controllers/auth.js";
import { registerUserSchema, loginUserSchema } from "../validation/auth.js";

const router = Router();

// POST /auth/register
router.post("/register", validateBody(registerUserSchema), ctrlWrapper(registerController));

// POST /auth/login
router.post("/login", validateBody(loginUserSchema), ctrlWrapper(loginController));

// POST /auth/refresh
router.post("/refresh", ctrlWrapper(refreshController));

// POST /auth/logout
router.post("/logout", ctrlWrapper(logoutController));

export default router;
