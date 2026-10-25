import { create } from "zustand";
import patientService from "../services/patientService";
import getErrorMessage from "../utils/getErrorMessage";

export const usePatientStore = create((set) => ({
  patients: [],
  isLoading: false,
  error: null,

  fetchPatients: async () => {
    set({ isLoading: true, error: null });

    try {
      const patients = await patientService.getPatientAssignments();
      set({ patients, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
    }
  },
}));
