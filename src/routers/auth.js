// src/routers/auth.js
import { Router } from "express";
import ctrlWrapper from "../utils/ctrlWrapper.js";
import { validateBody } from "../middlewares/validateBody.js";
import {
  registerUserController,
  loginUserController,
  refreshUserSessionController,
  logoutUserController,
} from "../controllers/auth.js";
import { registerUserSchema, loginUserSchema } from "../validation/auth.js";
import { authenticate } from "../middlewares/authenticate.js"; // ✅ додай це

const router = Router();

// POST /auth/register
router.post("/register", validateBody(registerUserSchema), ctrlWrapper(registerUserController));

// POST /auth/login
router.post("/login", validateBody(loginUserSchema), ctrlWrapper(loginUserController));

// POST /auth/refresh (доступ тільки з дійсним токеном)
router.post("/refresh", authenticate, ctrlWrapper(refreshUserSessionController)); // ✅ додали authenticate

// POST /auth/logout (доступ тільки для залогінених)
router.post("/logout", authenticate, ctrlWrapper(logoutUserController)); // ✅ додали authenticate

export default router;
