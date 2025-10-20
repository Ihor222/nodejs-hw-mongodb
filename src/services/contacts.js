import { ContactModel } from "../db/models/contact.js";
import { calculatePaginationData } from "../utils/calculatePaginationData.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import fs from "fs/promises";

// Отримати всі контакти з пагінацією, фільтром та сортуванням
export async function getAllContacts({ page = 1, perPage = 10, sortBy = "name", sortOrder = "asc", filter = {} }) {
  const limit = perPage;
  const skip = (page - 1) * perPage;

  const contactsQuery = ContactModel.find();

  if (filter.contactType) contactsQuery.where("contactType").in(filter.contactType);
  if (filter.isFavourite !== undefined) contactsQuery.where("isFavourite").equals(filter.isFavourite);

  const [totalItems, contacts] = await Promise.all([
    ContactModel.find().merge(contactsQuery).countDocuments(),
    contactsQuery.skip(skip).limit(limit).sort({ [sortBy]: sortOrder }).exec()
  ]);

  const paginationData = calculatePaginationData(totalItems, perPage, page);

  return { data: contacts, ...paginationData };
}

// Отримати контакт за ID
export async function getContactById(contactId) {
  const contact = await ContactModel.findById(contactId);
  return contact || null;
}

// Створити новий контакт (підтримка фото)
export async function createContact(payload, file) {
  if (file) {
    const photoUrl = await uploadToCloudinary(file.path);
    payload.photo = photoUrl;
    await fs.unlink(file.path); // Видаляємо тимчасовий файл
  }

  const contact = await ContactModel.create(payload);
  return contact;
}

// Оновити контакт (підтримка фото)
export async function updateContact(contactId, payload, file, options = {}) {
  if (file) {
    const photoUrl = await uploadToCloudinary(file.path);
    payload.photo = photoUrl;
    await fs.unlink(file.path);
  }

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
