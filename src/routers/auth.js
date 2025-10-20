import { Router } from "express";
import ctrlWrapper from "../utils/ctrlWrapper.js";
import { validateBody } from "../middlewares/validateBody.js";
import {
  registerController,
  loginController,
  refreshController,
  logoutController,
  sendResetEmailController,
  resetPasswordController
} from "../controllers/auth.js";

import {
  registerUserSchema,
  loginUserSchema,
  sendResetEmailSchema,
  resetPasswordSchema
} from "../validation/auth.js";

const router = Router();

// POST /auth/register
router.post("/register", validateBody(registerUserSchema), ctrlWrapper(registerController));

// POST /auth/login
router.post("/login", validateBody(loginUserSchema), ctrlWrapper(loginController));

// POST /auth/refresh
router.post("/refresh", ctrlWrapper(refreshController));

// POST /auth/logout
router.post("/logout", ctrlWrapper(logoutController));

// POST /auth/send-reset-email
router.post("/send-reset-email", validateBody(sendResetEmailSchema), ctrlWrapper(sendResetEmailController));

// POST /auth/reset-pwd
router.post("/reset-pwd", validateBody(resetPasswordSchema), ctrlWrapper(resetPasswordController));

export default router;
