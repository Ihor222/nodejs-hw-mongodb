// Імпортуємо іменований експорт ContactModel
import { ContactModel } from '../db/models/contact.js';

// Отримати всі контакти
export const getAllContacts = async () => {
  try {
    const contacts = await ContactModel.find();
    return contacts;
  } catch (err) {
    throw new Error('Error fetching contacts: ' + err.message);
  }
};

// Отримати контакт за ID
export const getContactById = async (contactId) => {
  try {
    const contact = await ContactModel.findById(contactId);
    return contact; // якщо не знайдено – поверне null
  } catch (err) {
    throw new Error('Error fetching contact by id: ' + err.message);
  }
};
