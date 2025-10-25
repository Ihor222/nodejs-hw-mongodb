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

const router = Router();

// Реєстрація користувача
router.post("/register", validateBody(registerUserSchema), ctrlWrapper(registerUserController));

// Логін користувача
router.post("/login", validateBody(loginUserSchema), ctrlWrapper(loginUserController));

// Оновлення сесії (refresh)
// refreshToken береться з cookies → authenticate тут НЕ потрібен
router.post("/refresh", ctrlWrapper(refreshUserSessionController));

// Вихід з системи (logout)
// також працює через cookies
router.post("/logout", ctrlWrapper(logoutUserController));

export default router;
