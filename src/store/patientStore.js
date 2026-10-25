import { isAxiosError } from "axios";
import { create } from "zustand";
import patientService from "../services/patientService";
import getErrorMessage from "../utils/getErrorMessage";

// 400/409 responses usually explain the problem in the body, which the
// shared getErrorMessage ignores, so read the common shapes first.
const getAssignError = (error) => {
  const data = isAxiosError(error) ? error.response?.data : null;

  if (typeof data === "string" && data.trim()) return data;
  if (typeof data?.message === "string") return data.message;

  if (data?.errors && typeof data.errors === "object") {
    const messages = Object.values(data.errors).flat();
    if (messages.length) return messages.join(" ");
  }

  if (typeof data?.title === "string") return data.title;

  if (isAxiosError(error) && error.response?.status === 401) {
    return "Your session has expired. Please sign in again.";
  }

  return getErrorMessage(error);
};

export const usePatientStore = create((set, get) => ({
  patients: [],
  isLoading: false,
  error: null,

  isAssigning: false,

  fetchPatients: async () => {
    set({ isLoading: true, error: null });

    try {
      const patients = await patientService.getPatientAssignments();
      set({ patients, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
    }
  },

  // pairs = [{ patientId, userId }]. Nothing is added locally: the list is
  // re-fetched once the backend confirmed at least one assignment.
  createAssignments: async (pairs) => {
    if (get().isAssigning) {
      return { succeeded: 0, errors: ["An assignment is already in progress."] };
    }

    set({ isAssigning: true });

    const results = await Promise.allSettled(
      pairs.map((pair) => patientService.createAssignment(pair)),
    );

    const errors = results
      .filter((result) => result.status === "rejected")
      .map((result) => getAssignError(result.reason));
    const succeeded = results.length - errors.length;

    if (succeeded > 0) await get().fetchPatients();

    set({ isAssigning: false });

    return { succeeded, errors: [...new Set(errors)] };
  },
}));
