import createHttpError from "http-errors";
import {
  getAllContacts,
  getContactById,
  createContact,
  deleteContact,
  updateContact,
} from "../services/contacts.js";

// Отримати всі контакти (з пагінацією, фільтром та сортуванням)
export async function getAllContactsController(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 10;
    const sortBy = req.query.sortBy || "name";
    const sortOrder = req.query.sortOrder || "asc";

    const filter = {};
    if (req.query.contactType) filter.contactType = req.query.contactType.split(",");
    if (req.query.isFavourite) filter.isFavourite = req.query.isFavourite === "true";

    const paginationData = await getAllContacts({
      userId: req.user._id, // Враховуємо користувача
      page,
      perPage,
      sortBy,
      sortOrder,
      filter,
    });

    res.json({
      status: 200,
      message: "Successfully found contacts!",
      data: paginationData,
    });
  } catch (err) {
    res.status(500).json({ status: 500, message: err.message });
  }
}

// Отримати контакт за ID
export async function getContactByIdController(req, res, next) {
  try {
    const { contactId } = req.params;
    const contact = await getContactById(contactId, req.user._id); // враховуємо userId

    if (!contact) {
      throw createHttpError(404, "Contact not found");
    }

    res.json({
      status: 200,
      message: `Successfully found contact with id ${contactId}!`,
      data: contact,
    });
  } catch (err) {
    next(err);
  }
}

// Створити новий контакт
export async function createContactController(req, res, next) {
  try {
    const contact = await createContact({
      ...req.body,
      userId: req.user._id, // додаємо userId
    });

    res.status(201).json({
      status: 201,
      message: "Successfully created a contact",
      data: contact,
    });
  } catch (err) {
    next(err);
  }
}

// Оновити контакт (PATCH)
export async function patchContactController(req, res, next) {
  try {
    const { contactId } = req.params;
    const updatedContact = await updateContact(contactId, req.body, req.user._id); // враховуємо userId

    if (!updatedContact) {
      throw createHttpError(404, "Contact not found");
    }

    res.json({
      status: 200,
      message: "Successfully patched a contact",
      data: updatedContact,
    });
  } catch (err) {
    next(err);
  }
}

// Видалити контакт
export async function deleteContactController(req, res, next) {
  try {
    const { contactId } = req.params;
    const deletedContact = await deleteContact(contactId, req.user._id); // враховуємо userId

    if (!deletedContact) {
      throw createHttpError(404, "Contact not found");
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
