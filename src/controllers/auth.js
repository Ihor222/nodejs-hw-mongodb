import jwt from "jsonwebtoken";
import createHttpError from "http-errors";
import { UserModel } from "../db/models/user.js";
import bcrypt from "bcrypt";


export async function registerUserController(req, res, next) {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      throw createHttpError(400, "Missing required fields: email, password, name");
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      throw createHttpError(409, "Email already in use");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserModel.create({ email, password: hashedPassword, name });

    res.status(201).json({
      status: 201,
      message: "Successfully registered a user!",
      data: {
        email: newUser.email,
        name: newUser.name,
      },
    });
  } catch (error) {
    next(error);
  }
}



export async function loginUserController(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      throw createHttpError(401, "Email or password is wrong");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw createHttpError(401, "Email or password is wrong");
    }

    // Створюємо токени
    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "30d" });

    user.token = accessToken;
    user.refreshToken = refreshToken;
    await user.save();

    // Встановлюємо refreshToken у httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 днів
    });

    res.json({
      status: 200,
      message: "Successfully logged in a user!",
      data: { accessToken }, // refreshToken в JSON не відправляємо
    });
  } catch (error) {
    next(error);
  }
}



export async function refreshUserSessionController(req, res, next) {
  try {
    const { refreshToken } = req.cookies; //  беремо з cookies
    if (!refreshToken) throw createHttpError(401, "Refresh token missing");

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch {
      throw createHttpError(401, "Invalid or expired refresh token");
    }

    const user = await UserModel.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      throw createHttpError(401, "User not authorized");
    }

    const newAccessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    user.token = newAccessToken;
    await user.save();

    res.json({
      status: 200,
      message: "Successfully refreshed a session!",
      data: { accessToken: newAccessToken },
    });
  } catch (error) {
    next(error);
  }
}

export async function logoutUserController(req, res, next) {
  try {
    const { refreshToken } = req.cookies; // беремо з cookies
    if (!refreshToken) throw createHttpError(401, "Refresh token missing");

    const user = await UserModel.findOne({ refreshToken });
    if (!user) throw createHttpError(401, "User not found");

    user.token = null;
    user.refreshToken = null;
    await user.save();

    res.clearCookie("refreshToken");
    res.clearCookie("sessionId"); 
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
