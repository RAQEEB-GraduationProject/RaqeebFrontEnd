import { create } from "zustand";
import patientService from "../services/patientService";
import getErrorMessage from "../utils/getErrorMessage";

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
  createProfileError: null,

  // userIds that the backend confirmed already have a profile which GET
  // /Patients (active profiles only) does not list = inactive profiles.
  // Kept for this session only: no endpoint lists inactive profiles.
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

    // Creates the medical profile of an existing Patient user. Returns true only
    // when the backend confirmed it (the message is stored in createProfileError).
    createPatientProfile: async (profile) => {
      if (get().isCreatingProfile) return false;

      const requestGeneration = generation;
      set({ isCreatingProfile: true, createProfileError: null });

      try {
        await patientService.createPatient(profile);
        if (!isCurrent(requestGeneration)) return true;
        set({ isCreatingProfile: false });

        // Refresh the list so the new profile is picked up everywhere.
        get().fetchPatients();

        return true;
      } catch (error) {
        if (!isCurrent(requestGeneration)) return false;
        set({ isCreatingProfile: false, createProfileError: getErrorMessage(error) });

        if (error?.errorCode === PROFILE_EXISTS) {
          await get().markIfProfileInactive(profile.userId);
        }

        return false;
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

    // Logout: drop the signed-in user's patients and ignore pending answers.
    reset: () => {
      generation += 1;
      set(initialState);
    },
  };
});
