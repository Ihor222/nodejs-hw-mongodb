import Joi from "joi";

export const createContactSchema = Joi.object({
  name: Joi.string().min(3).max(20).required(),
  email: Joi.string().email().min(3).max(50).required(),
  phone: Joi.string().min(3).max(20).required(),
});

export const updateContactSchema = Joi.object({
  name: Joi.string().min(3).max(20),
  email: Joi.string().email().min(3).max(50),
  phone: Joi.string().min(3).max(20),
}).min(1); // при оновленні треба хоча б 1 поле
