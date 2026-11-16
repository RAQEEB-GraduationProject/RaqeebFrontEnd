import { create } from "zustand";
import userService from "../services/userService";
import getErrorMessage from "../utils/getErrorMessage";

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
      set({ isCreating: false, createError: getErrorMessage(error) });
      return false;
    }
  },

  clearCreateError: () => set({ createError: null }),
}));
