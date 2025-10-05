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
export async function addContact(data) {
  try {
    const newContact = await ContactModel.create(data);
    return newContact;
  } catch (err) {
    throw new Error("Не вдалося створити контакт: " + err.message);
  }
}

// Оновлює існуючий контакт
export async function modifyContact(id, data, extraOptions = {}) {
  try {
    const result = await ContactModel.findOneAndUpdate(
      { _id: id },
      data,
      { new: true, ...extraOptions }
    );

    if (!result) return null;

    return {
      updated: result,
      isUpsert: Boolean(result?._id && extraOptions.upsert),
    };
  } catch (err) {
    throw new Error("Не вдалося оновити контакт: " + err.message);
  }
}

// Видаляє контакт за ID
export async function removeContact(id) {
  try {
    const deleted = await ContactModel.findOneAndDelete({ _id: id });
    return deleted;
  } catch (err) {
    throw new Error("Не вдалося видалити контакт: " + err.message);
  }
}
