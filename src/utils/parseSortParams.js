import { SORT_ORDER } from "../constants/index.js";

const normalizeSortOrder = (value) => {
  const allowed = Object.values(SORT_ORDER);
  return allowed.includes(value) ? value : SORT_ORDER.ASC;
};

const normalizeSortField = (value) => {
  const allowedFields = ["name"];
  return allowedFields.includes(value) ? value : "name";
};

export const extractSortParams = (query) => {
  const { sortOrder, sortBy } = query;

  return {
    sortOrder: normalizeSortOrder(sortOrder),
    sortBy: normalizeSortField(sortBy),
  };
};
