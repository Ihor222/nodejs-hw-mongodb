import { THIRTY_DAY } from "../constants/index.js";
import { 
  registerUser, loginUser, logoutUser, refreshUserSession,
  sendResetEmail, resetPassword
} from "../services/auth.js";

export async function registerUserController(req, res) {
  const user = await registerUser(req.body);

  res.status(201).json({
    status: 201,
    message: "Successfully registered a user!",
    data: user,
  });
}

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
}

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
}

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
}

export async function logoutUserController(req, res) {
  if (req.cookies.sessionId) {
    await logoutUser(req.cookies.sessionId);
  }

  res.clearCookie("sessionId");
  res.clearCookie("refreshToken");

  res.status(204).send();
}

export async function sendResetEmailController(req, res) {
  await sendResetEmail(req.body.email);

  res.status(200).json({
    status: 200,
    message: "Reset password email has been successfully sent.",
    data: {},
  });
}

export async function resetPasswordController(req, res) {
  const { token, password } = req.body;
  await resetPassword({ token, password });

  res.status(200).json({
    status: 200,
    message: "Password has been successfully reset.",
    data: {},
  });
}

export {
  registerUserController as registerController,
  loginUserController as loginController,
  refreshUserSessionController as refreshController,
  logoutUserController as logoutController,
};
