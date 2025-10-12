import createHttpError from "http-errors";

export const validateBody = (schema) => async (req, res, next) => {
  try {
    // Перевіряємо тіло запиту згідно зі схемою
    await schema.validateAsync(req.body, {
      abortEarly: false, // щоб показати всі помилки одразу
    });
    next();
  } catch (err) {
    // Якщо є помилки — створюємо 400 Bad Request
    const error = createHttpError(400, "Bad Request", {
      errors: err.details.map((d) => d.message),
    });
    next(error);
  }
};
