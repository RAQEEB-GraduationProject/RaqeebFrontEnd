import { create } from "zustand";
import assignmentService from "../services/assignmentService";
import getErrorMessage from "../utils/getErrorMessage";

/*
  Assignments only: patient <-> staff (doctor/nurse/caregiver) from
  GET /PatientAssignments/Assignments. Clinical patient data stays in
  patientStore; screens that need both join them by patientId.
*/

const STAFF_LISTS = ["assignedDoctor", "assignedNurses", "assignedCaregivers"];

// Drops the given assignment ids from every patient's staff lists.
const withoutAssignments = (assignments, removedIds) =>
  assignments.map((patient) => ({
    ...patient,
    ...Object.fromEntries(
      STAFF_LISTS.map((key) => [
        key,
        patient[key].filter((member) => !removedIds.has(member.assignmentId)),
      ]),
    ),
  }));

const BUSY_RESULT = {
  succeeded: 0,
  errors: ["An assignment update is already in progress."],
};

export const useAssignmentStore = create((set, get) => {
  // pairs = [{ patientId, userId }]. Nothing is added locally: the list is
  // re-fetched once the backend confirmed at least one creation.
  const runCreate = async (pairs) => {
    const results = await Promise.allSettled(
      pairs.map((pair) => assignmentService.createAssignment(pair)),
    );

    const errors = results
      .filter((result) => result.status === "rejected")
      .map((result) => getErrorMessage(result.reason));
    const succeeded = results.length - errors.length;

    if (succeeded > 0) await get().fetchAssignments();

    return { succeeded, errors };
  };

  // ids = assignment ids. Only ids the backend confirmed are removed from
  // local state; failed ones stay untouched.
  const runDelete = async (ids) => {
    const results = await Promise.allSettled(
      ids.map((id) => assignmentService.deleteAssignment(id)),
    );

    const removed = new Set();
    const errors = [];
    let outOfSync = false;

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        removed.add(ids[index]);
        return;
      }

      errors.push(getErrorMessage(result.reason));
      // Not found / already inactive: our list is stale.
      if (["notFound", "conflict"].includes(result.reason?.kind)) outOfSync = true;
    });

    if (removed.size > 0) {
      set((state) => ({
        assignments: withoutAssignments(state.assignments, removed),
      }));
    }

    if (outOfSync) await get().fetchAssignments();

    return { succeeded: removed.size, errors };
  };

  const finish = (results) => ({
    succeeded: results.reduce((sum, item) => sum + item.succeeded, 0),
    errors: [...new Set(results.flatMap((item) => item.errors))],
  });

  return {
    assignments: [],
    isLoading: false,
    error: null,

    // True while any create/delete is running (blocks repeated requests).
    isAssigning: false,

    fetchAssignments: async () => {
      set({ isLoading: true, error: null });

      try {
        const assignments = await assignmentService.getAssignments();
        set({ assignments, isLoading: false });
      } catch (error) {
        set({ isLoading: false, error: getErrorMessage(error) });
      }
    },

    createAssignments: async (pairs) => {
      if (get().isAssigning) return BUSY_RESULT;

      set({ isAssigning: true });
      const result = finish([await runCreate(pairs)]);
      set({ isAssigning: false });

      return result;
    },

    // Unassigns staff by assignment id.
    deleteAssignments: async (assignmentIds) => {
      if (get().isAssigning) return BUSY_RESULT;

      set({ isAssigning: true });
      const result = finish([await runDelete(assignmentIds)]);
      set({ isAssigning: false });

      return result;
    },

    // Applies removals and additions as one operation.
    saveChanges: async ({ create = [], remove = [] }) => {
      if (get().isAssigning) return BUSY_RESULT;

      set({ isAssigning: true });
      const deleted = await runDelete(remove);
      const created = await runCreate(create);
      set({ isAssigning: false });

      return {
        ...finish([deleted, created]),
        created: created.succeeded,
        removed: deleted.succeeded,
      };
    },
  };
});
