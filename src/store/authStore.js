import { create } from "zustand";
import { persist } from "zustand/middleware";
import authService from "../services/authService";
import { configureApi } from "../services/api";
import getErrorMessage from "../utils/getErrorMessage";
import { getDashboardPath } from "../utils/roles";

const emptySession = {
  user: null, // { userId, userName, name, role, hospitalId }
  token: null,
  expiration: null,
  isAuthenticated: false,
};

const isExpired = (expiration) =>
  Boolean(expiration) && new Date(expiration) <= new Date();

// رسالة خطأ الـ login (400/401 = بيانات غلط)
const getLoginError = (error) => {
  const status = error?.response?.status;
  if (status === 400 || status === 401) return "Invalid username or password.";
  return getErrorMessage(error);
};

export const useAuthStore = create(
  persist(
    (set) => ({
      ...emptySession,
      isLoading: false,
      error: null,

      // بترجّع الـ user لو نجح، و null لو فشل (والـ error بيتخزن في الـ store)
      login: async (credentials) => {
        set({ isLoading: true, error: null });

        try {
          const session = await authService.login(credentials);

          // Patient / Caregiver مالهمش داشبورد في الموقع
          if (!getDashboardPath(session.user.role)) {
            throw new Error("This account type cannot access the web portal.");
          }

          set({ ...session, isAuthenticated: true, isLoading: false });
          return session.user;
        } catch (error) {
          set({ isLoading: false, error: getLoginError(error) });
          return null;
        }
      },

      logout: () => set({ ...emptySession, error: null }),

      // لتعديل بيانات اليوزر محلياً (مثلاً من صفحة Profile)
      updateUser: (updates) =>
        set((state) => ({ user: { ...state.user, ...updates } })),

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      // نخزّن الـ session بس، مش isLoading ولا error
      partialize: ({ user, token, expiration, isAuthenticated }) => ({
        user,
        token,
        expiration,
        isAuthenticated,
      }),
      // لو الـ token منتهي وقت فتح الموقع → logout
      onRehydrateStorage: () => (state) => {
        if (state?.isAuthenticated && isExpired(state.expiration)) {
          state.logout();
        }
      },
    },
  ),
);

// ربط الـ axios بالـ store (إضافة الـ token + logout عند 401)
configureApi({
  getToken: () => useAuthStore.getState().token,
  onUnauthorized: () => useAuthStore.getState().logout(),
});
