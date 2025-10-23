import { ContactModel } from "../db/models/contact.js";
import { calculatePaginationData } from "../utils/calculatePaginationData.js";

// Отримати всі контакти користувача з пагінацією, фільтром та сортуванням
export async function getAllContacts({
  userId,
  page = 1,
  perPage = 10,
  sortBy = "name",
  sortOrder = "asc",
  filter = {}
}) {
  const limit = perPage;
  const skip = (page - 1) * perPage;

  // Створюємо базовий запит — лише контакти поточного користувача
  const contactsQuery = ContactModel.find({ userId });

  // Фільтр за типом контакту
  if (filter.contactType) {
    contactsQuery.where("contactType").in(filter.contactType);
  }

  // Фільтр за улюбленими контактами
  if (filter.isFavourite !== undefined) {
    contactsQuery.where("isFavourite").equals(filter.isFavourite);
  }

  // Підрахунок загальної кількості
  const [totalItems, contacts] = await Promise.all([
    ContactModel.countDocuments(contactsQuery.getQuery()),
    contactsQuery.skip(skip).limit(limit).sort({ [sortBy]: sortOrder }).exec()
  ]);

  const paginationData = calculatePaginationData(totalItems, perPage, page);

  return {
    data: contacts,
    ...paginationData
  };
}

// Отримати контакт за ID користувача
export async function getContactById(contactId, userId) {
  const contact = await ContactModel.findOne({ _id: contactId, userId });
  return contact || null;
}

// Створити новий контакт
export async function createContact(payload) {
  const contact = await ContactModel.create(payload);
  return contact;
}

// Оновити контакт (одночасно перевіряємо і userId, і _id)
export async function updateContact(contactId, userId, payload, options = {}) {
  const rawResult = await ContactModel.findOneAndUpdate(
    { _id: contactId, userId },
    payload,
    { new: true, includeResultMetadata: true, ...options }
  );

  if (!rawResult || !rawResult.value) return null;

  return {
    contact: rawResult.value,
    isNew: Boolean(rawResult?.lastErrorObject?.upserted)
  };
}

// Видалити контакт (одночасно перевіряємо і userId, і _id)
export async function deleteContact(contactId, userId) {
  const contact = await ContactModel.findOneAndDelete({ _id: contactId, userId });
  return contact || null;
}
