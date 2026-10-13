import { isAxiosError } from "axios";

const DEFAULT_MESSAGE = "Something went wrong. Please try again.";

const getErrorMessage = (error) => {
  if (!isAxiosError(error)) return error?.message || DEFAULT_MESSAGE;

  if (!error.response) {
    return "Cannot reach the server. Please check your connection.";
  }

  const { status, data } = error.response;

  if (status === 403) return "You do not have permission to do this.";
  if (status === 429) return "Too many attempts. Please try again later.";
  if (status >= 500) return "Server error. Please try again later.";

  // رسالة من الباك لو موجودة
  if (typeof data?.message === "string") return data.message;

  return DEFAULT_MESSAGE;
};

export default getErrorMessage;
