import { THIRTY_DAY } from "../constants/index.js";
import { registerUser, loginUser, logoutUser, refreshUserSession } from "../services/auth.js";

// Реєстрація користувача
export async function registerUserController(req, res) {
    const user = await registerUser(req.body);

    res.status(201).json({
        status: 201,
        message: "Successfully registered a user!",
        data: user,
    });
}

// Логін користувача
export async function loginUserController(req, res) {
    const session = await loginUser(req.body);

    res.cookie("refreshToken", session.refreshToken, {
        httpOnly: true,
        expires: new Date(Date.now() + THIRTY_DAY),
    });

    // Використовуємо _id сесії замість sessionId
    res.cookie("sessionId", session._id.toString(), {
        httpOnly: true,
        expires: new Date(Date.now() + THIRTY_DAY),
    });

    res.json({
        status: 200,
        message: "Successfully logged in a user!",
        data: {
            accessToken: session.accessToken,
        },
    });
}

// Допоміжна функція для встановлення cookies
const setupSession = (res, session) => {
    res.cookie("refreshToken", session.refreshToken, {
        httpOnly: true,
        expires: new Date(Date.now() + THIRTY_DAY),
    });
    res.cookie("sessionId", session._id.toString(), {
        httpOnly: true,
        expires: new Date(Date.now() + THIRTY_DAY),
    });
}

// Оновлення сесії
export async function refreshUserSessionController(req, res) {
  const session = await refreshUserSession({
    sessionId: req.session._id, // ✅ беремо з authenticate
    refreshToken: req.session.refreshToken,
  });

  res.cookie("refreshToken", session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAY),
  });
  res.cookie("sessionId", session._id.toString(), {
    httpOnly: true,
    expires: new Date(Date.now() + THIRTY_DAY),
  });

  res.json({
    status: 200,
    message: "Successfully refreshed a session!",
    data: {
      accessToken: session.accessToken,
    },
  });
}

// Вихід користувача
export async function logoutUserController(req, res) {
  await logoutUser(req.session._id); // беремо з authenticate
  res.clearCookie("sessionId");
  res.clearCookie("refreshToken");
  res.status(204).send();
}

