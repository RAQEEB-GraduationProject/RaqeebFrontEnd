import { create } from "zustand";
import userService from "../services/userService";
import getErrorMessage from "../utils/getErrorMessage";

export const useUserStore = create((set, get) => ({
  users: [],
  isLoading: false,
  error: null,

  // Users with the Patient role (GET /Users?role=Patient).
  patientUsers: [],
  isPatientUsersLoaded: false,
  isLoadingPatientUsers: false,
  patientUsersError: null,

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

  fetchPatientUsers: async () => {
    // One request at a time (covers StrictMode's double effect).
    if (get().isLoadingPatientUsers) return;

    set({ isLoadingPatientUsers: true, patientUsersError: null });

    try {
      const patientUsers = await userService.getPatientUsers();
      set({ patientUsers, isPatientUsersLoaded: true, isLoadingPatientUsers: false });
    } catch (error) {
      set({ isLoadingPatientUsers: false, patientUsersError: getErrorMessage(error) });
    }
  },

  // Returns the created user ({ userId, userName, email, role }) when the
  // backend confirmed success, or null otherwise (the message is stored in
  // createError).
  addUser: async (payload) => {
    if (get().isCreating) return null;

    set({ isCreating: true, createError: null });

    try {
      const createdUser = await userService.register(payload);
      set({ isCreating: false });

      // Refresh the list through the existing GET flow instead of inserting
      // a locally built object.
      get().fetchUsers();

      return createdUser;
    } catch (error) {
      set({ isCreating: false, createError: getErrorMessage(error) });
      return null;
    }
  },

  clearCreateError: () => set({ createError: null }),
}));
