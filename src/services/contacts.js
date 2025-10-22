// src/services/contacts.js
import { ContactModel } from "../db/models/contact.js";
import { calculatePaginationData } from "../utils/calculatePaginationData.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import fs from "fs/promises";

/**
 * Отримати всі контакти користувача з пагінацією, фільтром і сортуванням
 */
export async function getAllContacts({ userId, page = 1, perPage = 10, sortBy = "name", sortOrder = "asc", filter = {} }) {
  const limit = perPage;
  const skip = (page - 1) * perPage;

  const query = { userId };

  if (filter.contactType) query.contactType = { $in: filter.contactType };
  if (typeof filter.isFavourite !== "undefined") query.isFavourite = filter.isFavourite;

  const [totalItems, contacts] = await Promise.all([
    ContactModel.countDocuments(query),
    ContactModel.find(query)
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .exec(),
  ]);

  const paginationData = calculatePaginationData(totalItems, perPage, page);

  return { data: contacts, ...paginationData };
}

/**
 * Отримати контакт за ID (тільки для поточного користувача)
 */
export async function getContactById(contactId, userId) {
  const contact = await ContactModel.findOne({ _id: contactId, userId });
  return contact || null;
}

/**
 * Створити новий контакт (з підтримкою фото)
 */
export async function createContact(payload, file) {
  if (file) {
    const photoUrl = await uploadToCloudinary(file.path); // secure_url string
    payload.photo = photoUrl;
    // видаляємо тимчасовий файл
    try {
      await fs.unlink(file.path);
    } catch (err) {
      // просто логнемо, але не кидаємо помилку — файл можна видалити вручну
      console.warn(`Failed to unlink temp file ${file.path}: ${err.message}`);
    }
  }

  const contact = await ContactModel.create(payload);
  return contact;
}

/**
 * Оновити контакт користувача (з підтримкою фото)
 */
export async function updateContact(contactId, payload, file, { userId }) {
  if (file) {
    const photoUrl = await uploadToCloudinary(file.path);
    payload.photo = photoUrl;
    try {
      await fs.unlink(file.path);
    } catch (err) {
      console.warn(`Failed to unlink temp file ${file.path}: ${err.message}`);
    }
  }

  const updatedContact = await ContactModel.findOneAndUpdate(
    { _id: contactId, userId },
    { $set: payload },
    { new: true }
  );

  return updatedContact;
}

/**
 * Видалити контакт користувача
 */
export async function deleteContact(contactId, userId) {
  const deletedContact = await ContactModel.findOneAndDelete({ _id: contactId, userId });
  return deletedContact || null;
}
