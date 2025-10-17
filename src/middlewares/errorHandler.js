import { HttpError } from "http-errors";

export default function errorHandler(err, req, res, next) {
  // Якщо це http-специфічна помилка (через createHttpError)
  if (err instanceof HttpError) {
    const response = {
      status: err.status || 400,
      message: err.message || "Bad Request",
    };

    // Якщо були додаткові дані (наприклад, err.errors з Joi)
    if (err.errors) {
      response.errors = err.errors;
    }

    res.status(response.status).json(response);
    return;
  }

  // Інші (неочікувані) помилки
  res.status(500).json({
    status: 500,
    message: err.message || "Internal Server Error",
  });
}
