import { UserModel } from "../db/models/user.js";
import { SessionModel } from "../db/models/session.js"
import bcrypt from "bcrypt";
import createHttpError from "http-errors";
import { randomBytes } from "crypto";
import { FIFTEEN_MINUTES, THIRTY_DAY } from "../constants/index.js";

export async function registerUser(payload) {
    const user = await UserModel.findOne({ email: payload.email });
    if (user) throw createHttpError(409, "Email in use");

    const encryptedPassword = await bcrypt.hash(payload.password, 10);

    return await UserModel.create({
        ...payload,
        password: encryptedPassword,
    });
};

export async function loginUser(payload) {
    const user = await UserModel.findOne({ email: payload.email });
    if (!user) {
        throw createHttpError(401, "User not found");
    }

    const isEqual = await bcrypt.compare(payload.password, user.password);
    if (!isEqual) {
        throw createHttpError(401, "Unathorized");
    }

    await SessionModel.deleteOne({ userId: user._id });

    const accessToken = randomBytes(30).toString("base64");
    const refreshToken = randomBytes(30).toString("base64");

    return await SessionModel.create({
        userId: user._id,
        accessToken,
        refreshToken,
        accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
        refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAY),
    });
};

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

export async function refreshUserSession({sessionId, refreshToken}) {
    const session = await SessionModel.findOne({ _id: sessionId, refreshToken });
    if (!session) {
        throw createHttpError(401, "Session not found");
    }

    const isSessionTokenExpired = new Date() > new Date(session.refreshTokenValidUntil);
    if (isSessionTokenExpired) {
        throw createHttpError(401, "Session token expired");
    }

    const newSession = createSession();

    await SessionModel.deleteOne({ _id: sessionId, refreshToken });

    return await SessionModel.create({
        userId: session.userId,
        ...newSession,
    });
};

export async function logoutUser(sessionId) {
    await SessionModel.deleteOne({ _id: sessionId });  
};