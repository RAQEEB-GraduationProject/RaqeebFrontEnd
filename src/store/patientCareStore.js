import { create } from "zustand";
import patientService from "../services/patientService";
import userService from "../services/userService";
import getErrorMessage from "../utils/getErrorMessage";

/*
  Patient Care of ONE patient at a time:
    GET  /Patients/{patientId}/journal        -> `journal`
    POST /Patients/{patientId}/journal        -> addJournalEntry()
    GET  /Patients/{patientId}/appointments   -> `appointments`
    POST /Patients/{patientId}/appointments   -> addAppointment()
    GET  /Users?role=Doctor (Admin only)      -> `doctors` (appointment provider)
  Each list records the `patientId` it belongs to. Loaded the first time its
  section is opened, kept while the user moves around that patient's details,
  and dropped when the details page is left (see DoctorPatientDetails) or on
  logout (see authStore). Questions has no backend and is not handled here.
*/
const emptyList = { patientId: null, items: null, totalCount: 0, isLoading: false, error: null };

const initialState = {
  journal: emptyList,
  appointments: emptyList,
  doctors: { items: null, isLoading: false, error: null },

  // True while a record is being added (blocks double submits).
  isAdding: false,
};

const BUSY_ERROR = new Error("A record is already being added.");

const LISTS = {
  journal: { load: patientService.getJournal, add: patientService.addJournalEntry },
  appointments: { load: patientService.getAppointments, add: patientService.addAppointment },
};

export const usePatientCareStore = create((set, get) => {
  // Latest GET per list / reset() generation: only the latest request may
  // write its answer (another patient opened meanwhile, or reset()).
  const latestRequest = { journal: 0, appointments: 0, doctors: 0 };
  let generation = 0;

  const patchList = (kind, patch) => set((state) => ({ [kind]: { ...state[kind], ...patch } }));

  const fetchList = async (kind, patientId) => {
    const current = get()[kind];

    // One request per patient at a time (covers StrictMode's double effect).
    if (current.isLoading && current.patientId === patientId) return;

    const request = ++latestRequest[kind];
    const samePatient = current.patientId === patientId;

    set({
      [kind]: {
        patientId,
        // Keep the same patient's records on screen while they are refreshed.
        items: samePatient ? current.items : null,
        totalCount: samePatient ? current.totalCount : 0,
        isLoading: true,
        error: null,
      },
    });

    try {
      const result = await LISTS[kind].load(patientId);
      if (request !== latestRequest[kind]) return;
      patchList(kind, {
        items: result?.items ?? [],
        totalCount: result?.totalCount ?? 0,
        isLoading: false,
      });
    } catch (error) {
      if (request !== latestRequest[kind]) return;
      patchList(kind, { isLoading: false, error: getErrorMessage(error) });
    }
  };

  /*
    Adds one record. Returns
      { entry }  created (the displayed list of that patient is reloaded)
      { error }  the ApiError (or Error): the caller shows field / general
                 messages; nothing is stored here.
  */
  const addRecord = async (kind, patientId, values) => {
    if (get().isAdding) return { error: BUSY_ERROR };

    const requestGeneration = generation;
    set({ isAdding: true });

    try {
      const created = await LISTS[kind].add(patientId, values);
      if (requestGeneration !== generation) return { entry: created };
      set({ isAdding: false });

      // Reload so order and totals come from the backend.
      if (get()[kind].patientId === patientId) fetchList(kind, patientId);

      return { entry: created };
    } catch (error) {
      if (requestGeneration === generation) set({ isAdding: false });
      return { error };
    }
  };

  return {
    ...initialState,

    fetchJournal: (patientId) => fetchList("journal", patientId),
    fetchAppointments: (patientId) => fetchList("appointments", patientId),
    addJournalEntry: (patientId, values) => addRecord("journal", patientId, values),
    addAppointment: (patientId, values) => addRecord("appointments", patientId, values),

    // Active doctors of the hospital (Admin only), for the provider picker.
    fetchDoctors: async () => {
      if (get().doctors.isLoading) return;

      const request = ++latestRequest.doctors;
      set({ doctors: { items: get().doctors.items, isLoading: true, error: null } });

      try {
        const users = await userService.getDoctorUsers();
        if (request !== latestRequest.doctors) return;
        set({ doctors: { items: users.filter((user) => user.isActive !== false), isLoading: false, error: null } });
      } catch (error) {
        if (request !== latestRequest.doctors) return;
        set({ doctors: { items: null, isLoading: false, error: getErrorMessage(error) } });
      }
    },

    // Leaving the patient / logout: drop the records, ignore pending answers.
    reset: () => {
      Object.keys(latestRequest).forEach((key) => (latestRequest[key] += 1));
      generation += 1;
      set(initialState);
    },
  };
});
