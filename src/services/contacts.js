import { ContactModel } from "../db/models/contact.js";

// Повертає список усіх контактів
export async function fetchAllContacts() {
  try {
    const allContacts = await ContactModel.find();
    return allContacts;
  } catch (err) {
    throw new Error("Не вдалося отримати контакти: " + err.message);
  }
}

// Повертає контакт за його ID
export async function fetchContactById(id) {
  try {
    const contact = await ContactModel.findById(id);
    return contact || null;
  } catch (err) {
    throw new Error("Не вдалося знайти контакт: " + err.message);
  }
}

// Створює новий контакт
export async function createContact(payload) {
    const contact = await ContactModel.create(payload)
    return contact;
};

// Оновлює існуючий контакт
export async function updateContact(contactId, payload, options = {}) {
    const rawResult = await ContactModel.findOneAndUpdate(
        { _id: contactId },
        payload,
        {
            new: true,
            includeResultMetadata: true,
            ...options,
        },
    );

    if (!rawResult || !rawResult.value)
        return null;

    return {
        contact: rawResult.value,
        isNew: Boolean(rawResult?.lastErrorObject?.upserted),
    };
};

// Видаляє контакт за ID
export async function deleteContact(contactId) {
    const contact = await ContactModel.findOneAndDelete({
        _id: contactId,
    });

    return contact;
  };
