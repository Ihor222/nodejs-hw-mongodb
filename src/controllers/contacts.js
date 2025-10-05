import createHttpError from "http-errors";
import { getAllContacts,
    getContactById,
    createContact,
    deleteContact,
    updateContact } from "../services/contacts.js";



export async function getAllContactsController(req, res) {
    const contacts = await getAllContacts();

    res.json({
        status: 200,
        message: "Successfully found contacts!",
        data: contacts,
    });
};

export async function  getContactByIdController(req, res, next) {
    const { contactId } = req.params;
    const contact = await getContactById(contactId);

    if (!contact) {
        throw createHttpError(404, "Contact nor found");
    }

    res.json({
        status: 200,
        message: `"Successfully found contact with id ${contactId}!"`,
        data: contact,
    });
};

export async function createContactController(req, res) {
    const contact = await createContact(req.body);

    res.json({
        status: 201,
        message: "Successfully created a contact",
        data: contact,
    });

};

export async function patchContactController(req, res, next) {
    const { contactId } = req.params;
    const result = await updateContact(contactId, req.body);

    if (!result) {
        next(createHttpError(404, "Contact not found"));
        return;
    }

    res.json({
        status: 200,
        message: "Successfully patched a contact",
        data: result.contact,
    });
}

export async function deleteContactController(req, res) {
    const { contactId } = req.params;

    const contact = await deleteContact(contactId);

    if (!contact) {
        next(createHttpError(404, "Contact not found"));
        return;
    }

    res.status(204).send();
};