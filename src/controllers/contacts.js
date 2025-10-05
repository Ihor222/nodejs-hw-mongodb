import createError from "http-errors";
import { 
    getAllContacts, 
    getContactById, 
    createContact, 
    updateContact, 
    deleteContact 
} from "../services/contacts.js";

// Повертає всі контакти
export const fetchAllContacts = async (req, res, next) => {
    try {
        const contacts = await getAllContacts();
        res.status(200).json({
            status: 200,
            message: "Contacts retrieved successfully",
            data: contacts,
        });
    } catch (err) {
        next(err);
    }
};

// Повертає контакт за ID
export const fetchContactById = async (req, res, next) => {
    try {
        const { contactId } = req.params;
        const contact = await getContactById(contactId);

        if (!contact) {
            throw createError(404, "Contact not found");
        }

        res.status(200).json({
            status: 200,
            message: `Contact with ID ${contactId} retrieved successfully`,
            data: contact,
        });
    } catch (err) {
        next(err);
    }
};

// Створює новий контакт
export const addNewContact = async (req, res, next) => {
    try {
        const contact = await createContact(req.body);
        res.status(201).json({
            status: 201,
            message: "New contact created successfully",
            data: contact,
        });
    } catch (err) {
        next(err);
    }
};

// Оновлює контакт
export const modifyContact = async (req, res, next) => {
    try {
        const { contactId } = req.params;
        const updated = await updateContact(contactId, req.body);

        if (!updated) {
            throw createError(404, "Contact not found");
        }

        res.status(200).json({
            status: 200,
            message: "Contact updated successfully",
            data: updated.contact,
        });
    } catch (err) {
        next(err);
    }
};

// Видаляє контакт
export const removeContact = async (req, res, next) => {
    try {
        const { contactId } = req.params;
        const deleted = await deleteContact(contactId);

        if (!deleted) {
            throw createError(404, "Contact not found");
        }

        res.status(204).send();
    } catch (err) {
        next(err);
    }
};
