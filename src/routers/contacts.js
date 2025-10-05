import { Router } from "express";
import {
    fetchAllContacts,
    fetchContactById,
    addNewContact,
    modifyContact,
    removeContact
} from "../controllers/contacts.js";
import ctrlWrapper from "../utils/ctrlWrapper.js";

const contactsRouter = Router();

// Повертає всі контакти
contactsRouter.get("/", ctrlWrapper(fetchAllContacts));

// Повертає контакт по ID
contactsRouter.get("/:contactId", ctrlWrapper(fetchContactById));

// Додає новий контакт
contactsRouter.post("/", ctrlWrapper(addNewContact));

// Часткове оновлення контакту
contactsRouter.patch("/:contactId", ctrlWrapper(modifyContact));

// Видаляє контакт
contactsRouter.delete("/:contactId", ctrlWrapper(removeContact));

export default contactsRouter;
