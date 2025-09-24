import express from "express";
import cors from "cors";
import pino from "pino";
import pinoHttp from "pino-http";
import getEnvVar from "./utils/getEnvVar.js";
import { getAllContacts, getContactById } from "./services/contacts.js";

const PORT = Number(getEnvVar("PORT") || 8080);

export default function setupServer() {
    const app = express();

    // Middleware
    app.use(express.json());
    app.use(cors());

    // Logger
    const logger = pino({
        transport: { target: "pino-pretty", options: { colorize: true } }
    });
    app.use(pinoHttp({ logger }));

    // Root route
    app.get("/", (req, res) => {
        res.status(200).json({ message: "API is running" });
    });

    // Get all contacts
    app.get("/contacts", async (req, res, next) => {
        try {
            const contacts = await getAllContacts();
            res.status(200).json({
                status: 200,
                message: "Successfully found contacts!",
                data: contacts,
            });
        } catch (err) {
            next(err);
        }
    });

    // Get contact by id
    app.get("/contacts/:contactId", async (req, res, next) => {
        try {
            const { contactId } = req.params;
            const contact = await getContactById(contactId);

            if (!contact) {
                return res.status(404).json({ message: "Contact not found" });
            }

            res.status(200).json({
                status: 200,
                message: `Successfully found contact with id ${contactId}!`,
                data: contact,
            });
        } catch (err) {
            next(err);
        }
    });

    // 404 handler
    app.use((req, res) => {
        res.status(404).json({ message: "Not Found" });
    });

    // Global error handler
    app.use((err, req, res, next) => {
        res.status(500).json({
            message: "Something went wrong",
            error: err.message,
        });
    });

    // Start server
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

    return app;
}
