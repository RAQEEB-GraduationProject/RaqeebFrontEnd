import { ApiError, getFallbackMessage } from "../services/apiResponse";

/*
  Message to show the user for any error. API failures are already normalized
  to ApiError by the axios interceptor (backend message when usable, otherwise
  a status-based fallback), so this only needs to read it.
*/
const getErrorMessage = (error) => {
  if (error instanceof ApiError) {
    // The backend's top-level validation message is generic ("One or more
    // validation errors occurred."); the field messages are the useful part.
    if (error.kind === "validation" && error.errors.length > 0) {
      return [...new Set(error.errors.map((item) => item.message))].join(" ");
    }

    return error.message;
  }

  return error?.message || getFallbackMessage("unknown");
};

export default getErrorMessage;
