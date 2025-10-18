import Joi from "joi";

export const createContactSchema = Joi.object({
  name: Joi.string().min(3).max(20).required(),
  email: Joi.string().email().min(3).max(50).required(),

  // Замінили phone → phoneNumber
  phoneNumber: Joi.string()
    .pattern(/^\+380\d{9}$/)
    .message("phoneNumber must be a valid Ukrainian phone number (+380XXXXXXXXX)")
    .required(),

  // Додали додаткові поля, щоб не було помилок "is not allowed"
  isFavourite: Joi.boolean().default(false),

  contactType: Joi.string()
    .valid("work", "home", "personal")
    .required(),
});

export const updateContactSchema = Joi.object({
  name: Joi.string().min(3).max(20),
  email: Joi.string().email().min(3).max(50),
  phoneNumber: Joi.string()
    .pattern(/^\+380\d{9}$/)
    .message("phoneNumber must be a valid Ukrainian phone number (+380XXXXXXXXX)"),
  isFavourite: Joi.boolean(),
  contactType: Joi.string().valid("work", "home", "personal"),
}).min(1);
