import { create } from "zustand";
import userService from "../services/userService";
import getErrorMessage from "../utils/getErrorMessage";

/*
  Admin screens: the hospital's users (GET /Users) and Patient users
  (GET /Users?role=Patient). Hospital-scoped data of the signed-in admin, so
  it is cleared on logout (see authStore).
*/
const initialState = {
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
};

export const useUserStore = create((set, get) => {
  // Bumped by reset() (logout). A request started before it must not write
  // its answer, or trigger follow-up requests, into the next session.
  let generation = 0;
  const isCurrent = (requestGeneration) => requestGeneration === generation;

  return {
    ...initialState,

    fetchUsers: async () => {
      const requestGeneration = generation;
      set({ isLoading: true, error: null });

      try {
        const users = await userService.getUsers();
        if (!isCurrent(requestGeneration)) return;
        set({ users, isLoading: false });
      } catch (error) {
        if (!isCurrent(requestGeneration)) return;
        set({ isLoading: false, error: getErrorMessage(error) });
      }
    },

    fetchPatientUsers: async () => {
      // One request at a time (covers StrictMode's double effect).
      if (get().isLoadingPatientUsers) return;

      const requestGeneration = generation;
      set({ isLoadingPatientUsers: true, patientUsersError: null });

      try {
        const patientUsers = await userService.getPatientUsers();
        if (!isCurrent(requestGeneration)) return;
        set({ patientUsers, isPatientUsersLoaded: true, isLoadingPatientUsers: false });
      } catch (error) {
        if (!isCurrent(requestGeneration)) return;
        set({ isLoadingPatientUsers: false, patientUsersError: getErrorMessage(error) });
      }
    },

    // Returns the created user ({ userId, userName, email, role }) when the
    // backend confirmed success, or null otherwise (the message is stored in
    // createError).
    addUser: async (payload) => {
      if (get().isCreating) return null;

      const requestGeneration = generation;
      set({ isCreating: true, createError: null });

      try {
        const createdUser = await userService.register(payload);
        if (!isCurrent(requestGeneration)) return createdUser;
        set({ isCreating: false });

        // Refresh the list through the existing GET flow instead of inserting
        // a locally built object.
        get().fetchUsers();

        return createdUser;
      } catch (error) {
        if (!isCurrent(requestGeneration)) return null;
        set({ isCreating: false, createError: getErrorMessage(error) });
        return null;
      }
    },

    clearCreateError: () => set({ createError: null }),

    // Logout: drop the hospital's users and ignore pending answers.
    reset: () => {
      generation += 1;
      set(initialState);
    },
  };
});
