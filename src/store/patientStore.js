import { create } from "zustand";
import patientService from "../services/patientService";
import getErrorMessage from "../utils/getErrorMessage";

/*
  Patients only: the patient records from GET /Patients (clinical data).
  Who is assigned to whom lives in assignmentStore.
  `isLoaded` tells "not fetched yet" apart from "fetched, empty".
*/
export const usePatientStore = create((set, get) => ({
  patients: [],
  isLoaded: false,
  isLoading: false,
  error: null,

  fetchPatients: async () => {
    // One request at a time (covers StrictMode's double effect).
    if (get().isLoading) return;

    set({ isLoading: true, error: null });

    try {
      const patients = await patientService.getPatients();
      set({ patients, isLoaded: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: getErrorMessage(error) });
    }
  },
}));
