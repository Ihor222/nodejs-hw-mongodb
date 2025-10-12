import createHttpError from "http-errors";
import {
  getAllContacts,
  getContactById,
  createContact,
  deleteContact,
  updateContact,
} from "../services/contacts.js";

// Отримати всі контакти (з пагінацією)
// Отримати всі контакти (з пагінацією, фільтром та сортуванням)
export async function getAllContactsController(req, res) {
  try {
    // Query параметри
    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 10;
    const sortBy = req.query.sortBy || "name";         // за якою властивістю сортувати
    const sortOrder = req.query.sortOrder || "asc";    // asc або desc

    // Опціональні фільтри
    const filter = {};
    if (req.query.contactType) filter.contactType = req.query.contactType.split(",");
    if (req.query.isFavourite) filter.isFavourite = req.query.isFavourite === "true";

    // Викликаємо сервіс
    const paginationData = await getAllContacts({ page, perPage, sortBy, sortOrder, filter });

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
export async function getContactByIdController(req, res) {
  const { contactId } = req.params;
  const contact = await getContactById(contactId);

  if (!contact) {
    throw createHttpError(404, "Contact not found");
  }

  res.json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
}

// Створити новий контакт
export async function createContactController(req, res) {
  const contact = await createContact(req.body);

  res.status(201).json({
    status: 201,
    message: "Successfully created a contact",
    data: contact,
  });
}

// Оновити контакт (PATCH)
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

// Видалити контакт
export async function deleteContactController(req, res, next) {
  const { contactId } = req.params;
  const contact = await deleteContact(contactId);

  if (!contact) {
    next(createHttpError(404, "Contact not found"));
    return;
  }

  res.status(204).send();
}
