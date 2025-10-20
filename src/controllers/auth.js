import { THIRTY_DAY } from "../constants/index.js";
import { registerUser, loginUser, logoutUser, refreshUserSession } from "../services/auth.js";

// Контролер реєстрації користувача
export async function registerUserController(req, res) {
    const user = await registerUser(req.body);

    res.status(201).json({
        status: 201,
        message: "Successfully registered a user!",
        data: user, // без пароля
    });
};

// Контролер логіну користувача
export async function loginUserController(req, res) {
    const session = await loginUser(req.body);

    res.cookie("refreshToken", session.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        expires: new Date(Date.now() + THIRTY_DAY),
    });
    res.cookie("sessionId", session._id, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        expires: new Date(Date.now() + THIRTY_DAY),
    });

    res.status(200).json({
        status: 200,
        message: "Successfully logged in an user!",
        data: { accessToken: session.accessToken },
    });
};

// Допоміжна функція для встановлення cookies сесії
const setupSessionCookies = (res, session) => {
    res.cookie("refreshToken", session.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        expires: new Date(Date.now() + THIRTY_DAY),
    });
    res.cookie("sessionId", session._id, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        expires: new Date(Date.now() + THIRTY_DAY),
    });
};

// Контролер оновлення сесії (refresh)
export async function refreshUserSessionController(req, res) {
    const session = await refreshUserSession({
        sessionId: req.cookies.sessionId,
        refreshToken: req.cookies.refreshToken,
    });

    setupSessionCookies(res, session);

    res.status(200).json({
        status: 200,
        message: "Successfully refreshed a session!",
        data: { accessToken: session.accessToken },
    });
};

// Контролер логауту
export async function logoutUserController(req, res) {
    if (req.cookies.sessionId) {
        await logoutUser(req.cookies.sessionId);
    }

    res.clearCookie("sessionId");
    res.clearCookie("refreshToken");

    res.status(204).send(); // Без тіла відповіді
};
export {
  registerUserController as registerController,
  loginUserController as loginController,
  refreshUserSessionController as refreshController,
  logoutUserController as logoutController,
};
