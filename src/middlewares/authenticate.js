// src/middlewares/authenticate.js
import createHttpError from "http-errors";
import { SessionModel } from "../db/models/session.js";
import { UserModel } from "../db/models/user.js";

export async function authenticate(req, res, next) {
  try {
    const { sessionId, refreshToken } = req.cookies;

    if (!sessionId || !refreshToken) {
      throw createHttpError(401, "No cookies provided");
    }

    const session = await SessionModel.findOne({
      _id: sessionId,
      refreshToken,
    });

    if (!session) {
      throw createHttpError(401, "Session not found");
    }

    const user = await UserModel.findById(session.userId);
    if (!user) {
      throw createHttpError(401, "User not found");
    }

    req.user = user;
    req.session = session;

    next();
  } catch (error) {
    next(error);
  }
}
