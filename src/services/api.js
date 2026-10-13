import axios from "axios";

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

// لو الـ token بقى مش صالح (401) واليوزر داخل فعلاً → logout تلقائي
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes("/Auth/login");
    if (error.response?.status === 401 && !isLoginRequest) {
      onUnauthorized();
    }
    return Promise.reject(error);
  },
);

export default api;
