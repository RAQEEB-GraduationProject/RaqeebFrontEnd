import { create } from "zustand";
import patientService from "../services/patientService";
import getErrorMessage from "../utils/getErrorMessage";

/*
  Diagnostics (read-only) of ONE patient at a time:
    GET /Patients/{patientId}/diagnostics/labs     -> `labs`
    GET /Patients/{patientId}/diagnostics/imaging  -> `imaging`
  The two lists load and fail independently. Each records the `patientId` it
  belongs to. Loaded the first time its section is shown, kept while the user
  moves around that patient's details, and dropped when the details page is
  left (see DoctorPatientDetails) or on logout (see authStore).
  The PDF files are not stored here (see diagnosticsFileService).
*/
const emptyList = { patientId: null, items: null, isLoading: false, error: null };

const initialState = { labs: emptyList, imaging: emptyList };

const LOADERS = {
  labs: patientService.getLabResults,
  imaging: patientService.getImagingRecords,
};

export const usePatientDiagnosticsStore = create((set, get) => {
  // Latest GET per list: only that one may write its answer (another patient
  // opened meanwhile, or reset() while it was pending).
  const latestRequest = { labs: 0, imaging: 0 };

  return {
    ...initialState,

    // kind: "labs" | "imaging"
    fetchList: async (kind, patientId) => {
      const current = get()[kind];

      // One request per patient at a time (covers StrictMode's double effect).
      if (current.isLoading && current.patientId === patientId) return;

      const request = ++latestRequest[kind];

      set({
        [kind]: {
          patientId,
          // Keep the same patient's records on screen while they are refreshed.
          items: current.patientId === patientId ? current.items : null,
          isLoading: true,
          error: null,
        },
      });

      try {
        const items = await LOADERS[kind](patientId);
        if (request !== latestRequest[kind]) return;
        set({ [kind]: { patientId, items, isLoading: false, error: null } });
      } catch (error) {
        if (request !== latestRequest[kind]) return;
        set((state) => ({
          [kind]: { ...state[kind], isLoading: false, error: getErrorMessage(error) },
        }));
      }
    },

    // Leaving the patient / logout: drop the records, ignore pending answers.
    reset: () => {
      Object.keys(latestRequest).forEach((key) => (latestRequest[key] += 1));
      set(initialState);
    },
  };
});
