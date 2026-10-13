import { create } from "zustand";
import userService from "../services/userService";
import getErrorMessage from "../utils/getErrorMessage";

export const useUserStore = create((set) => ({
  users: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });

    try {
      const users = await userService.getUsers();
      set({ users, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
    }
  },
}));
