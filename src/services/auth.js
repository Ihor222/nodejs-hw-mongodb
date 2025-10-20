import { UserModel } from "../db/models/user.js";
import { SessionModel } from "../db/models/session.js";
import bcrypt from "bcrypt";
import createHttpError from "http-errors";
import { randomBytes } from "crypto";
import { FIFTEEN_MINUTES, THIRTY_DAY } from "../constants/index.js";
import jwt from "jsonwebtoken";
import getEnvVar from "../utils/getEnvVar.js";
import { sendMail } from "../utils/sendMail.js";

// ------------------ REGISTER ------------------ //
export async function registerUser(payload) {
  const existingUser = await UserModel.findOne({ email: payload.email });
  if (existingUser) throw createHttpError(409, "Email in use");

  const hashedPassword = await bcrypt.hash(payload.password, 10);
  const user = await UserModel.create({
    ...payload,
    password: hashedPassword,
  });

  const userObject = user.toObject();
  delete userObject.password;
  return userObject;
}

// ------------------ LOGIN ------------------ //
export async function loginUser({ email, password }) {
  const user = await UserModel.findOne({ email });
  if (!user) throw createHttpError(401, "Invalid email or password");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw createHttpError(401, "Invalid email or password");

  await SessionModel.deleteOne({ userId: user._id });

  const sessionData = createSession();
  const session = await SessionModel.create({
    userId: user._id,
    ...sessionData,
  });

  return session;
}

// ------------------ SESSION HELPERS ------------------ //
const createSession = () => {
  const accessToken = randomBytes(30).toString("base64");
  const refreshToken = randomBytes(30).toString("base64");

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAY),
  };
};

// ------------------ REFRESH SESSION ------------------ //
export async function refreshUserSession({ sessionId, refreshToken }) {
  const session = await SessionModel.findOne({ _id: sessionId, refreshToken });
  if (!session) throw createHttpError(401, "Session not found");

  const isExpired = new Date() > new Date(session.refreshTokenValidUntil);
  if (isExpired) throw createHttpError(401, "Session token expired");

  await SessionModel.deleteOne({ _id: sessionId, refreshToken });

  const newSessionData = createSession();
  const newSession = await SessionModel.create({
    userId: session.userId,
    ...newSessionData,
  });

  return newSession;
}

// ------------------ LOGOUT ------------------ //
export async function logoutUser(sessionId) {
  await SessionModel.deleteOne({ _id: sessionId });
}

// ------------------ SEND RESET EMAIL ------------------ //
export async function sendResetEmail(email) {
  const user = await UserModel.findOne({ email });
  if (!user) throw createHttpError(404, "User not found!");

  const token = jwt.sign(
    { email: user.email },
    getEnvVar("JWT_SECRET"),
    { expiresIn: "5m" }
  );

  const resetLink = `${getEnvVar("APP_DOMAIN")}/reset-password?token=${token}`;

  try {
    await sendMail({
      to: email,
      subject: "Password Reset",
      html: `<p>Click the link to reset your password: <a href="${resetLink}">${resetLink}</a></p>`,
    });
  } catch (err) {
    throw createHttpError(500, "Failed to send the email, please try again later.");
  }
}

// ------------------ RESET PASSWORD ------------------ //
export async function resetPassword({ token, password }) {
  let payload;
  try {
    payload = jwt.verify(token, getEnvVar("JWT_SECRET"));
  } catch (error) {
    throw createHttpError(401, "Token is expired or invalid.");
  }

  const user = await UserModel.findOne({ email: payload.email });
  if (!user) throw createHttpError(404, "User not found!");

  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;
  await user.save();

  await SessionModel.deleteMany({ userId: user._id });
}
