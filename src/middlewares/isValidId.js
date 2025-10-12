import { isValidObjectId } from "mongoose";
import createHttpError from "http-errors";

export function isValidId(req, res, next) {
  const { contactId } = req.params;

  // Перевіряємо, чи є contactId валідним ObjectId
  if (!isValidObjectId(contactId)) {
    return next(createHttpError(400, `Invalid contact ID: ${contactId}`));
  }

  next();
}
