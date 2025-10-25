import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"; 
import pino from "pino";
import pinoHttp from "pino-http";
import getEnvVar from "./utils/getEnvVar.js";
import contactsRouter from "./routers/contacts.js";
import authRouter from "./routers/auth.js";
import errorHandler from "./middlewares/errorHandler.js";
import notFoundHandler from "./middlewares/notFoundHandler.js";

const PORT = Number(getEnvVar("PORT", 8080));

export default function startServer() {
    const app = express();

    app.use(express.json());
    app.use(cors());
    app.use(cookieParser()); // ✅ ОБОВʼЯЗКОВО перед роутами

    const logger = pino({
        transport: { target: "pino-pretty", options: { colorize: true } }
    });
    app.use(pinoHttp({ logger }));

    app.get("/", (req, res) => {
        res.status(200).json({ message: "Server is up and running" });
    });

    app.use("/auth", authRouter);
    app.use("/contacts", contactsRouter);

    app.use(notFoundHandler);
    app.use(errorHandler);

    app.listen(PORT, () => {
        console.log(`Application listening on port ${PORT}`);
    });

    return app;
}
