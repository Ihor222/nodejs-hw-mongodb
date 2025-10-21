const normalizeContactType = (type) => {
  if (typeof type !== "string") return undefined;

  const allowedTypes = ["work", "home", "personal"];
  return allowedTypes.includes(type) ? type : undefined;
};

const normalizeFavourite = (favourite) => {
  if (typeof favourite !== "string") return undefined;

  return favourite.toLowerCase() === "true"
    ? true
    : favourite.toLowerCase() === "false"
    ? false
    : undefined;
};

export const parseFilterParams = (query) => {
  const { contactType, isFavourite } = query;

  const typeFilter = normalizeContactType(contactType);
  const favouriteFilter = normalizeFavourite(isFavourite);

  return {
    contactType: typeFilter,
    isFavourite: favouriteFilter,
  };
};
