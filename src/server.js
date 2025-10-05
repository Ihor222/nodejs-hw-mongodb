import express from "express";
import cors from "cors";
import pino from "pino";
import pinoHttp from "pino-http";
import getEnvVar from "./utils/getEnvVar.js";
import contactsRouter from "./routers/contacts.js";
import errorHandler from "./middlewares/errorHandler.js";
import notFoundHandler from "./middlewares/notFoundHandler.js";

const PORT = Number(getEnvVar("PORT", 8080));

export default function startServer() {
    const app = express();

    // Body parser
    app.use(express.json());

    // Enable CORS
    app.use(cors());

    // Logger setup
    const logger = pino({
        transport: { target: "pino-pretty", options: { colorize: true } }
    });
    app.use(pinoHttp({ logger }));

    // Health check endpoint
    app.get("/", (req, res) => {
        res.status(200).json({ message: "Server is up and running" });
    });

    // Contacts API routes
    app.use("/contacts", contactsRouter);

    // 404 handler for unmatched routes
    app.use(notFoundHandler);

    // Centralized error handler
    app.use(errorHandler);

    // Start listening
    app.listen(PORT, () => {
        console.log(`Application listening on port ${PORT}`);
    });

    return app;
}
