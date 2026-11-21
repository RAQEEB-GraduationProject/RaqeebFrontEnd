import { create } from "zustand";
import patientService from "../services/patientService";
import getErrorMessage from "../utils/getErrorMessage";

/*
  Patient details page (shared header + Overview tab):
  GET /Patients/{patientId}/overview for ONE patient at a time. `patientId`
  says which patient `overview` / `error` belong to, so a previous patient's
  data is never shown for another one. Cleared on logout (see authStore).
*/
const initialState = {
  patientId: null,
  overview: null,
  isLoading: false,
  error: null,
};

export const usePatientOverviewStore = create((set, get) => {
  // Id of the latest request. Only that request may write its answer, so a
  // response is dropped when another patient was opened meanwhile OR the
  // store was reset (logout) while it was pending, even if the same patient
  // is opened again by the next session before the old answer arrives.
  let latestRequest = 0;

  return {
    ...initialState,

    fetchOverview: async (patientId) => {
      const current = get();

      // One request per patient at a time (covers StrictMode's double effect).
      if (current.isLoading && current.patientId === patientId) return;

      const request = ++latestRequest;

      set({
        patientId,
        // Keep the same patient's data on screen while it is refreshed.
        overview: current.patientId === patientId ? current.overview : null,
        isLoading: true,
        error: null,
      });

      try {
        const overview = await patientService.getPatientOverview(patientId);
        if (request !== latestRequest) return;
        set({ overview, isLoading: false });
      } catch (error) {
        if (request !== latestRequest) return;
        set({ isLoading: false, error: getErrorMessage(error) });
      }
    },

    // Drops the cached patient data and invalidates any pending request.
    reset: () => {
      latestRequest += 1;
      set(initialState);
    },
  };
});
