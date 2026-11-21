import { create } from "zustand";
import patientService from "../services/patientService";
import getErrorMessage from "../utils/getErrorMessage";

/*
  Medical History of ONE patient at a time:
    GET  /Patients/{patientId}/medical-history  -> `history`
    POST /Patients/{patientId}/medical-history  -> addEntry()
  `patientId` says which patient `history` / `error` belong to. Loaded the
  first time the Medical History section is opened, kept while the user moves
  around that patient's details, and dropped when the details page is left
  (see DoctorPatientDetails) or on logout (see authStore).
*/
const initialState = {
  patientId: null,
  history: null,
  isLoading: false,
  error: null,

  // True while a record is being added (blocks double submits).
  isAdding: false,
};

const BUSY_ERROR = new Error("A record is already being added.");

export const usePatientMedicalHistoryStore = create((set, get) => {
  // Id of the latest GET: only that one may write its answer (another
  // patient opened meanwhile, or reset() while it was pending).
  let latestRequest = 0;
  // Bumped by reset(): an add started before it must not touch the store.
  let generation = 0;

  const fetchHistory = async (patientId) => {
    const current = get();

    // One request per patient at a time (covers StrictMode's double effect).
    if (current.isLoading && current.patientId === patientId) return;

    const request = ++latestRequest;

    set({
      patientId,
      // Keep the same patient's records on screen while they are refreshed.
      history: current.patientId === patientId ? current.history : null,
      isLoading: true,
      error: null,
    });

    try {
      const history = await patientService.getMedicalHistory(patientId);
      if (request !== latestRequest) return;
      set({ history, isLoading: false });
    } catch (error) {
      if (request !== latestRequest) return;
      set({ isLoading: false, error: getErrorMessage(error) });
    }
  };

  return {
    ...initialState,

    fetchHistory,

    /*
      Adds one record. Used by the patient details page and by the optional
      step after a patient profile is created. Returns
        { entry }  created (the displayed history of that patient is reloaded)
        { error }  the ApiError (or Error): the caller shows field / general
                   messages; nothing is stored here.
    */
    addEntry: async (patientId, entry) => {
      if (get().isAdding) return { error: BUSY_ERROR };

      const requestGeneration = generation;
      set({ isAdding: true });

      try {
        const created = await patientService.addMedicalHistoryEntry(patientId, entry);
        if (requestGeneration !== generation) return { entry: created };
        set({ isAdding: false });

        // Reload (same as other creates in the app) so totals and order come
        // from the backend. Only when this patient's history is displayed.
        if (get().patientId === patientId) fetchHistory(patientId);

        return { entry: created };
      } catch (error) {
        if (requestGeneration === generation) set({ isAdding: false });
        return { error };
      }
    },

    // Leaving the patient / logout: drop the records, ignore pending answers.
    reset: () => {
      latestRequest += 1;
      generation += 1;
      set(initialState);
    },
  };
});
