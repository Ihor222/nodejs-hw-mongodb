import { UserModel } from "../db/models/user.js";
import { SessionModel } from "../db/models/session.js";
import bcrypt from "bcryptjs";
import createHttpError from "http-errors";
import { randomBytes } from "crypto";
import { FIFTEEN_MINUTES, THIRTY_DAY } from "../constants/index.js";

// Реєстрація користувача
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

// Логін користувача
export async function loginUser({ email, password }) {
    const user = await UserModel.findOne({ email });
    if (!user) throw createHttpError(401, "Invalid email or password");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw createHttpError(401, "Invalid email or password");

    // Видаляємо стару сесію
    await SessionModel.deleteOne({ userId: user._id });

    // Створюємо нову сесію
    const sessionData = createSession();
    const session = await SessionModel.create({
        userId: user._id,
        ...sessionData,
    });

    return session;
}

// Допоміжна функція для генерації токенів
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

// Оновлення сесії (refresh)
export async function refreshUserSession({ sessionId, refreshToken }) {
    const session = await SessionModel.findOne({ _id: sessionId, refreshToken });
    if (!session) throw createHttpError(401, "Session not found");

    const isExpired = new Date() > new Date(session.refreshTokenValidUntil);
    if (isExpired) throw createHttpError(401, "Session token expired");

    // Видаляємо стару сесію
    await SessionModel.deleteOne({ _id: sessionId, refreshToken });

    // Створюємо нову сесію
    const newSessionData = createSession();
    const newSession = await SessionModel.create({
        userId: session.userId,
        ...newSessionData,
    });

    return newSession;
}

// Логаут користувача
export async function logoutUser(sessionId) {
    await SessionModel.deleteOne({ _id: sessionId });
}
