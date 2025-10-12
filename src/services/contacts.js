import { ContactModel } from "../db/models/contact.js";
import { calculatePaginationData } from "../utils/calculatePaginationData.js";

// Отримати всі контакти з пагінацією, фільтром та сортуванням
export async function getAllContacts({
  page = 1,
  perPage = 10,
  sortBy = "name",
  sortOrder = "asc",
  filter = {}
}) {
  const limit = perPage;
  const skip = (page - 1) * perPage;

  // Створюємо запит
  const contactsQuery = ContactModel.find();

  // Фільтр за типом контакту
  if (filter.contactType) {
    contactsQuery.where("contactType").in(filter.contactType);
  }

  // Фільтр за улюбленими контактами
  if (filter.isFavourite !== undefined) {
    contactsQuery.where("isFavourite").equals(filter.isFavourite);
  }

  // Виконуємо запит і рахуємо загальну кількість елементів
  const [totalItems, contacts] = await Promise.all([
    ContactModel.find().merge(contactsQuery).countDocuments(),
    contactsQuery.skip(skip).limit(limit).sort({ [sortBy]: sortOrder }).exec()
  ]);

  const paginationData = calculatePaginationData(totalItems, perPage, page);

  return {
    data: contacts,
    ...paginationData
  };
}

// Отримати контакт за ID
export async function getContactById(contactId) {
  const contact = await ContactModel.findById(contactId);
  return contact || null;
}

// Створити новий контакт
export async function createContact(payload) {
  const contact = await ContactModel.create(payload);
  return contact;
}

// Оновити контакт
export async function updateContact(contactId, payload, options = {}) {
  const rawResult = await ContactModel.findOneAndUpdate(
    { _id: contactId },
    payload,
    { new: true, includeResultMetadata: true, ...options }
  );

  if (!rawResult || !rawResult.value) return null;

  return {
    contact: rawResult.value,
    isNew: Boolean(rawResult?.lastErrorObject?.upserted)
  };
}

// Видалити контакт
export async function deleteContact(contactId) {
  const contact = await ContactModel.findOneAndDelete({ _id: contactId });
  return contact || null;
}
