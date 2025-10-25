import { THIRTY_DAY } from "../constants/index.js";
import { registerUser, loginUser, logoutUser, refreshUserSession } from "../services/auth.js";

export async function registerUserController(req, res, next) {
  try {
    const user = await registerUser(req.body);

    res.status(201).json({
      status: 201,
      message: "Successfully registered a user!",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}

export async function loginUserController(req, res, next) {
  try {
    const session = await loginUser(req.body);

    setupSession(res, session);

    res.json({
      status: 200,
      message: "Successfully logged in a user!",
      data: {
        accessToken: session.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
}

const setupSession = (res, session) => {
  res.cookie("refreshToken", session.refreshToken, {
    httpOnly: true,
    maxAge: THIRTY_DAY,
  });
  res.cookie("sessionId", session._id, {
    httpOnly: true,
    maxAge: THIRTY_DAY,
  });
};

export async function refreshUserSessionController(req, res, next) {
  try {
    const session = await refreshUserSession({
      sessionId: req.cookies.sessionId,
      refreshToken: req.cookies.refreshToken,
    });

    setupSession(res, session);

    res.json({
      status: 200,
      message: "Successfully refreshed a session!",
      data: {
        accessToken: session.accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function logoutUserController(req, res, next) {
  try {
    if (req.cookies.sessionId) {
      await logoutUser(req.cookies.sessionId);
    }

    res.clearCookie("sessionId");
    res.clearCookie("refreshToken");

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}