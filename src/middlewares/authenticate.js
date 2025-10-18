// src/middlewares/authenticate.js
import createHttpError from "http-errors";
import { UserModel } from "../db/models/user.js";
import { SessionModel } from "../db/models/session.js";

export async function authenticate(req, res, next) {
    try {
        const authHeader = req.get("Authorization");
        if (!authHeader) {
            throw createHttpError(401, "Please provide Authorization header");
        }

        const [bearer, token] = authHeader.split(" ");
        if (bearer !== "Bearer" || !token) {
            throw createHttpError(401, "Auth header should be of type Bearer");
        }

        const session = await SessionModel.findOne({ accessToken: token });
        if (!session) {
            throw createHttpError(401, "Session not found");
        }

        const isAccessTokenExpired = new Date() > new Date(session.accessTokenValidUntil);
        if (isAccessTokenExpired) {
            throw createHttpError(401, "Access token expired");
        }

        const user = await UserModel.findById(session.userId);
        if (!user) {
            throw createHttpError(401, "User not found");
        }

        // додаємо користувача і сесію до запиту
        req.user = user;
        req.session = session;

        next();
    } catch (error) {
        next(error);
    }
};
