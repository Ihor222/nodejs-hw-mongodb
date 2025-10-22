// src/utils/uploadToCloudinary.js
import cloudinary from "cloudinary";
import getEnvVar from "./getEnvVar.js"; // якщо у тебе інший шлях — підкоригуй

cloudinary.v2.config({
  cloud_name: getEnvVar("CLOUDINARY_CLOUD_NAME"),
  api_key: getEnvVar("CLOUDINARY_API_KEY"),
  api_secret: getEnvVar("CLOUDINARY_API_SECRET"),
});

/**
 * Завантажує локальний файл на Cloudinary і повертає secure_url (string).
 * @param {string} filePath - шлях до тимчасового файлу
 * @returns {Promise<string>} secure_url
 */
export async function uploadToCloudinary(filePath) {
  try {
    const result = await cloudinary.v2.uploader.upload(filePath, {
      folder: "contacts_photos", // опціонально: організувати у папку
      use_filename: false,
      unique_filename: true,
      resource_type: "image",
    });

    // result.secure_url — найбільш корисне поле
    return result.secure_url;
  } catch (err) {
    // прокинемо помилку вище з більш інформативним текстом
    throw new Error(`Cloudinary upload failed: ${err.message}`);
  }
}
