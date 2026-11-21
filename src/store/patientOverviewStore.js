import { create } from "zustand";
import patientService from "../services/patientService";
import getErrorMessage from "../utils/getErrorMessage";

/*
  Patient Overview tab: GET /Patients/{patientId}/overview for ONE patient at
  a time. `patientId` says which patient `overview` / `error` belong to, so a
  previous patient's data is never shown for another one.
*/
export const usePatientOverviewStore = create((set, get) => ({
  patientId: null,
  overview: null,
  isLoading: false,
  error: null,

  fetchOverview: async (patientId) => {
    const current = get();

    // One request per patient at a time (covers StrictMode's double effect).
    if (current.isLoading && current.patientId === patientId) return;

    set({
      patientId,
      // Keep the same patient's data on screen while it is refreshed.
      overview: current.patientId === patientId ? current.overview : null,
      isLoading: true,
      error: null,
    });

    try {
      const overview = await patientService.getPatientOverview(patientId);
      // Another patient was opened meanwhile: this answer is stale.
      if (get().patientId !== patientId) return;
      set({ overview, isLoading: false });
    } catch (error) {
      if (get().patientId !== patientId) return;
      set({ isLoading: false, error: getErrorMessage(error) });
    }
  },
}));
