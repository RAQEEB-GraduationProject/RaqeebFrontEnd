import axios from "axios";
import { toApiError, unwrapResponse } from "./apiResponse";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

/*
  الـ store بيستدعي configureApi مرة واحدة (في authStore.js).
  عملنا كده عشان api.js ميستوردش الـ store (بدل ما يحصل import دائري).
*/
let getToken = () => null;
let onUnauthorized = () => {};

export const configureApi = (handlers) => {
  getToken = handlers.getToken ?? getToken;
  onUnauthorized = handlers.onUnauthorized ?? onUnauthorized;
};

// بيحط الـ token في كل request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/*
  Response handling lives in apiResponse.js:
    - success: the ApiResponse<T> envelope (if any) is stripped, so callers get the payload;
    - failure: every error becomes an ApiError with a usable message.
  401 on a logged-in session (not the login call itself) → logout تلقائي.
*/
api.interceptors.response.use(
  (response) => {
    try {
      return unwrapResponse(response);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error) => {
    const apiError = toApiError(error);
    const isLoginRequest = error.config?.url?.includes("/Auth/login");

    if (apiError.status === 401 && !isLoginRequest) {
      onUnauthorized();
    }

    return Promise.reject(apiError);
  },
);

export default api;
