// Blank strings, nulls and non-text all mean "not provided".
export const textOrNull = (value) =>
  typeof value === "string" && value.trim() ? value.trim() : null;
