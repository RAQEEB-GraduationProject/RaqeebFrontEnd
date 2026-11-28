import { create } from "zustand";
import patientService from "../services/patientService";
import getDisplayName from "../utils/getDisplayName";
import getErrorMessage from "../utils/getErrorMessage";
import { usePatientOverviewStore } from "./patientOverviewStore";

/*
  Patients only: the patient records from GET /Patients (clinical data).
  Who is assigned to whom lives in assignmentStore.
  `isLoaded` tells "not fetched yet" apart from "fetched, empty".
  The list depends on who is signed in (Admin: whole hospital; Doctor/Nurse:
  assigned patients only), so it is cleared on logout (see authStore).
*/
// errorCode of POST /Patients when the user already has a profile, active or not.
const PROFILE_EXISTS = "PATIENT_PROFILE_EXISTS";

const initialState = {
  patients: [],
  isLoaded: false,
  isLoading: false,
  error: null,

  isCreatingProfile: false,
  createProfileError: null, // the failed request's error (see utils/formErrors)

  // userIds that the backend confirmed already have a profile which GET
  // /Patients does not list = treated as inactive profiles. Kept for this
  // session only.
  inactiveProfileUserIds: [],
};

export const usePatientStore = create((set, get) => {
  // Bumped by reset() (logout). A request started before it must not write
  // its answer, or trigger follow-up requests, into the next session.
  let generation = 0;
  const isCurrent = (requestGeneration) => requestGeneration === generation;

  return {
    ...initialState,

    fetchPatients: async () => {
      // One request at a time (covers StrictMode's double effect).
      if (get().isLoading) return;

      const requestGeneration = generation;
      set({ isLoading: true, error: null });

      try {
        const patients = await patientService.getPatients();
        if (!isCurrent(requestGeneration)) return;
        set({ patients, isLoaded: true, isLoading: false });
      } catch (error) {
        if (!isCurrent(requestGeneration)) return;
        set({ isLoading: false, error: getErrorMessage(error) });
      }
    },

    // Creates the medical profile of an existing Patient user. Returns the
    // created profile (its `id` is the new patientId) only when the backend
    // confirmed it; otherwise null (the error is stored in createProfileError).
    createPatientProfile: async (profile) => {
      if (get().isCreatingProfile) return null;

      const requestGeneration = generation;
      set({ isCreatingProfile: true, createProfileError: null });

      try {
        const created = await patientService.createPatient(profile);
        if (!isCurrent(requestGeneration)) return created;
        set({ isCreatingProfile: false });

        // Refresh the list so the new profile is picked up everywhere.
        get().fetchPatients();

        return created;
      } catch (error) {
        if (!isCurrent(requestGeneration)) return null;
        set({ isCreatingProfile: false, createProfileError: error });

        if (error?.errorCode === PROFILE_EXISTS) {
          await get().markIfProfileInactive(profile.userId);
        }

        return null;
      }
    },

    // POST /Patients says this user already has a profile. Re-read the active
    // list: if the profile is there it was just stale; if not, it is inactive.
    // When the list cannot be refreshed nothing is guessed.
    markIfProfileInactive: async (userId) => {
      const requestGeneration = generation;

      try {
        const patients = await patientService.getPatients();
        if (!isCurrent(requestGeneration)) return;
        set({ patients, isLoaded: true });

        if (!patients.some((patient) => patient.userId === userId)) {
          set((state) => ({
            inactiveProfileUserIds: [...new Set([...state.inactiveProfileUserIds, userId])],
          }));
        }
      } catch {
        // Keep the original "already has a profile" message.
      }
    },

    clearCreateProfileError: () => set({ createProfileError: null }),

    // Saves the medical profile (all nine fields, see patientService). Returns
    //   { record }  the updated patient, also applied to the list and to the
    //               open patient details page;
    //   { error }   the ApiError (or Error) for the form to show.
    updatePatient: async (patientId, values) => {
      const requestGeneration = generation;

      try {
        const record = await patientService.updatePatient(patientId, values);

        if (isCurrent(requestGeneration)) {
          set((state) => ({
            patients: state.patients.map((patient) =>
              patient.id === record.id ? record : patient,
            ),
          }));
          usePatientOverviewStore.getState().applyPatient(record);
        }

        return { record };
      } catch (error) {
        return { error };
      }
    },

    // An account was edited (see userStore): keep the account fields of that
    // user's patient record in step.
    applyAccount: ({ id, fullName, email, phoneNumber }) =>
      set((state) => ({
        patients: state.patients.map((patient) => {
          if (patient.userId !== id) return patient;

          const next = { ...patient, fullName, email, phoneNumber };
          return { ...next, name: getDisplayName(next, "Unknown patient") };
        }),
      })),

    // Logout: drop the signed-in user's patients and ignore pending answers.
    reset: () => {
      generation += 1;
      set(initialState);
    },
  };
});
