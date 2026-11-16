import { ApiError, getFallbackMessage } from "../services/apiResponse";

/*
  Message to show the user for any error. API failures are already normalized
  to ApiError by the axios interceptor (backend message when usable, otherwise
  a status-based fallback), so this only needs to read it.
*/
const getErrorMessage = (error) => {
  if (error instanceof ApiError) return error.message;

  return error?.message || getFallbackMessage("unknown");
};

export default getErrorMessage;
