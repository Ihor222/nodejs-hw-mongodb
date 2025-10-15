import createHttpError from "http-errors";

export const validateBody = (schema) => async (req, res, next) => {
  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (err) {
    // Форматуємо масив з об'єктами { path, message }
    const formattedErrors = err.details.map(d => ({
      path: d.path.join("."), // поле, де помилка
      message: d.message      // текст помилки
    }));

    const error = createHttpError(400, "Validation error", {
      errors: formattedErrors,
    });
    next(error);
  }
};
