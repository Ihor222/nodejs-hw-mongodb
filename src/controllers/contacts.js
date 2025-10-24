import createHttpError from "http-errors";
import { getAllContacts, getContactById, createContact, deleteContact, updateContact } from "../services/contacts.js";
import { parsePaginationParams } from "../utils/parsePaginationParams.js";
import { parseSortParams } from "../utils/parseSortParams.js";
import { parseFilterParams } from "../utils/parseFilterParams.js";

// GET /contacts
export async function getAllContactsController(req, res) {
    const { page, perPage } = parsePaginationParams(req.query);
    const { sortOrder, sortBy } = parseSortParams(req.query);
    const filter = parseFilterParams(req.query);

    const contacts = await getAllContacts({
        userId: req.user._id, // тільки контакти залогіненого користувача
        page,
        perPage,
        sortOrder,
        sortBy,
        filter,
    });

    res.json({
        status: 200,
        message: "Successfully found contacts!",
        data: contacts,
    });
}

// GET /contacts/:contactId
export async function getContactByIdController(req, res, next) {
    const { contactId } = req.params;

    const contact = await getContactById(contactId, req.user._id); // шукаємо по _id та userId

    if (!contact) {
        next(createHttpError(404, `Contact not found with id ${contactId}`));
        return;
    }

    res.json({
        status: 200,
        message: `Successfully found contact with id ${contactId}!`,
        data: contact,
    });
}

// POST /contacts
export async function createContactController(req, res) {
    const contact = await createContact({
        ...req.body,
        userId: req.user._id, // додаємо userId
    });

    res.status(201).json({
        status: 201,
        message: "Successfully created a contact",
        data: contact,
    });
}

// PATCH /contacts/:contactId
export async function patchContactController(req, res, next) {
  const { contactId } = req.params;
  const result = await updateContact(contactId, req.user._id, req.body); 

  if (!result) {
    next(createHttpError(404, "Contact not found"));
    return;
  }

  res.json({
    status: 200,
    message: "Successfully patched a contact",
    data: result,
  });
}


// DELETE /contacts/:contactId
export async function deleteContactController(req, res, next) {
    const { contactId } = req.params;

    const contact = await deleteContact(contactId, req.user._id); // видаляємо тільки свій контакт

    if (!contact) {
        next(createHttpError(404, "Contact not found"));
        return;
    }

    res.status(204).send();
}
