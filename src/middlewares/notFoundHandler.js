import createHttpError from "http-errors";

export default function notFoundHandler(req, res, next) {
  // Якщо жоден маршрут не збігся
  next(createHttpError(404, `Route ${req.originalUrl} not found`));
}
