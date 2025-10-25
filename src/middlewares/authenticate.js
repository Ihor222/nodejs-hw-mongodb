// src/middlewares/authenticate.js
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import { UserModel } from "../db/models/user.js";

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.get("Authorization");
    if (!authHeader) throw createHttpError(401, "Authorization header missing");

    const [type, token] = authHeader.split(" ");
    if (type !== "Bearer" || !token) throw createHttpError(401, "Invalid Authorization header format");

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      throw createHttpError(401, "Invalid or expired token");
    }

    const user = await UserModel.findById(decoded.id);
    if (!user) throw createHttpError(401, "User not found");

    // Перевірка токена лише для контактів
    if (user.token !== token) throw createHttpError(401, "User not authorized");

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
