import { create } from "zustand";
import { isAxiosError } from "axios";
import userService from "../services/userService";
import getErrorMessage from "../utils/getErrorMessage";

// Registration errors (400/409) usually carry details that the shared
// getErrorMessage ignores, so read the common shapes before falling back to it.
const getCreateError = (error) => {
  const data = isAxiosError(error) ? error.response?.data : null;

  if (typeof data === "string" && data.trim()) return data;
  if (typeof data?.message === "string") return data.message;

  if (Array.isArray(data) && data.length) {
    return data
      .map((item) => item?.description ?? item?.message ?? item)
      .filter((item) => typeof item === "string")
      .join(" ");
  }

  if (data?.errors && typeof data.errors === "object") {
    const messages = Object.values(data.errors).flat();
    if (messages.length) return messages.join(" ");
  }

  if (typeof data?.title === "string") return data.title;

  return getErrorMessage(error);
};

export const useUserStore = create((set, get) => ({
  users: [],
  isLoading: false,
  error: null,

  isCreating: false,
  createError: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });

    try {
      const users = await userService.getUsers();
      set({ users, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
    }
  },

  // Returns true only when the backend confirmed success, false otherwise
  // (the message is stored in createError).
  addUser: async (payload) => {
    if (get().isCreating) return false;

    set({ isCreating: true, createError: null });

    try {
      await userService.register(payload);
      set({ isCreating: false });

      // The register response shape isn't documented, so refresh the list
      // through the existing GET flow instead of inserting a guessed object.
      get().fetchUsers();

      return true;
    } catch (error) {
      set({ isCreating: false, createError: getCreateError(error) });
      return false;
    }
  },

  clearCreateError: () => set({ createError: null }),
}));
