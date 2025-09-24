import { Contact } from '../models/contact.js';

export const getAllContacts = async () => {
    try {
        const contacts = await Contact.find(); // отримує всі документи з колекції
        return contacts;
    } catch (err) {
        throw new Error('Error fetching contacts: ' + err.message);
    }
};
