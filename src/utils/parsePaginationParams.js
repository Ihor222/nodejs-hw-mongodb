const toValidNumber = (value, fallback) => {
  if (typeof value !== "string") return fallback;

  const num = Number.parseInt(value, 10);
  return Number.isFinite(num) && num > 0 ? num : fallback;
};

export const parsePaginationParams = (query) => {
  const { page, perPage } = query;

  const currentPage = toValidNumber(page, 1);
  const limit = toValidNumber(perPage, 10);

  return {
    page: currentPage,
    perPage: limit,
  };
};
