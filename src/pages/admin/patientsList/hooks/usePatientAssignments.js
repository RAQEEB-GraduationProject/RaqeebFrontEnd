import { useEffect, useMemo, useState } from "react";

import { useAssignmentStore } from "../../../../store/assignmentStore";
import { usePatientStore } from "../../../../store/patientStore";
import { useUserStore } from "../../../../store/userStore";

const ROLES = ["doctor", "nurse", "caregiver"];

// API field that holds each role's assigned staff.
const ROLE_FIELDS = {
  doctor: "assignedDoctor",
  nurse: "assignedNurses",
  caregiver: "assignedCaregivers",
};

// Risk order of the table: Critical, High, Medium, Stable. A missing or
// unknown risk level goes after Stable.
const RISK_ORDER = ["critical", "high", "medium", "stable"];

const riskRank = (patient) => {
  const rank = RISK_ORDER.indexOf(String(patient.risk ?? "").trim().toLowerCase());

  return rank === -1 ? RISK_ORDER.length : rank;
};

// profileStatus: "active" (profile listed by GET /Patients; the row's isActive
// says whether that profile is active), "inactive" (the backend confirmed a
// profile exists but it is not listed) or "missing".
const PROFILE_ACTIVE = "active";
const PROFILE_INACTIVE = "inactive";
const PROFILE_MISSING = "missing";

const isUnassigned =(patient) =>
  ROLES.every((role) => patient.assigned[role].length === 0);

const NO_STAFF = {
  assignedDoctor: [],
  assignedNurses: [],
  assignedCaregivers: [],
};

/*
  Builds the Patients & assignments rows. One row per user with the Patient
  role (GET /Users?role=Patient), so users without a medical profile are
  listed too. Two other sources are joined in, with no per-row requests:
    - patientStore (GET /Patients): the medical profile, matched by userId.
      No match = the user still needs "Complete patient account" (hasProfile).
    - assignmentStore (GET /PatientAssignments/Assignments): the care team,
      matched by the profile id (patientId). `assigned` holds staff userIds,
      resolved to names through `staffById`.
  Rows without a profile have `id: null`: they cannot be assigned yet. Only
  rows with `canAssign` (active, with a profile) can receive a care team.
*/
export default function usePatientAssignments() {
  const apiPatients = useAssignmentStore((state) => state.assignments);
  const isAssignmentsLoaded = useAssignmentStore((state) => state.isLoaded);
  const isAssignmentsLoading = useAssignmentStore((state) => state.isLoading);
  const assignmentsError = useAssignmentStore((state) => state.error);
  const fetchAssignments = useAssignmentStore((state) => state.fetchAssignments);
  const isAssigning = useAssignmentStore((state) => state.isAssigning);
  const createAssignments = useAssignmentStore((state) => state.createAssignments);
  const deleteAssignments = useAssignmentStore((state) => state.deleteAssignments);

  const patientRecords = usePatientStore((state) => state.patients);
  const isRecordsLoaded = usePatientStore((state) => state.isLoaded);
  const isRecordsLoading = usePatientStore((state) => state.isLoading);
  const recordsError = usePatientStore((state) => state.error);
  const inactiveProfileUserIds = usePatientStore((state) => state.inactiveProfileUserIds);
  const fetchPatientRecords = usePatientStore((state) => state.fetchPatients);

  const users = useUserStore((state) => state.users);
  const fetchUsers = useUserStore((state) => state.fetchUsers);

  const patientUsers = useUserStore((state) => state.patientUsers);
  const isPatientUsersLoaded = useUserStore((state) => state.isPatientUsersLoaded);
  const isPatientUsersLoading = useUserStore((state) => state.isLoadingPatientUsers);
  const patientUsersError = useUserStore((state) => state.patientUsersError);
  const fetchPatientUsers = useUserStore((state) => state.fetchPatientUsers);

  useEffect(() => {
    fetchPatientUsers();
    fetchAssignments();
    fetchPatientRecords();
    fetchUsers();
  }, [fetchPatientUsers, fetchAssignments, fetchPatientRecords, fetchUsers]);

  // Rows are only built once all three sources arrived: without the profiles
  // every user would briefly look like "no medical profile".
  const isReady = isPatientUsersLoaded && isRecordsLoaded && isAssignmentsLoaded;
  const error = patientUsersError ?? recordsError ?? assignmentsError;
  const isLoading =
    !error && (isPatientUsersLoading || isRecordsLoading || isAssignmentsLoading || !isReady);

  const fetchAll = () => {
    fetchPatientUsers();
    fetchAssignments();
    fetchPatientRecords();
  };

  const [search, setSearch] = useState("");
  // { role: "doctor" | "nurse" | "caregiver", staffId } | { role: "unassigned" } | null
  const [staffFilter, setStaffFilter] = useState(null);

  // Assignable staff: active doctors/nurses/caregivers from the users list
  // (user.id is the backend userId), plus anyone already shown in the
  // assignments so existing names always resolve.
  const staff = useMemo(() => {
    const byId = new Map();

    users.forEach((user) => {
      const role = user.role?.toLowerCase();

      if (user.isActive && ROLES.includes(role)) {
        byId.set(user.id, {
          id: user.id,
          role,
          name: user.userName,
          detail: user.email,
        });
      }
    });

    apiPatients.forEach((patient) => {
      ROLES.forEach((role) => {
        patient[ROLE_FIELDS[role]].forEach((member) => {
          if (!byId.has(member.userId)) {
            byId.set(member.userId, {
              id: member.userId,
              role,
              name: member.name,
            });
          }
        });
      });
    });

    return [...byId.values()];
  }, [apiPatients, users]);

  const recordsByUserId = useMemo(
    () => new Map(patientRecords.map((record) => [record.userId, record])),
    [patientRecords],
  );

  const assignmentsByPatientId = useMemo(
    () => new Map(apiPatients.map((assignment) => [assignment.patientId, assignment])),
    [apiPatients],
  );

  const patients = useMemo(() => {
    if (!isReady) return [];

    return patientUsers.map((user) => {
      const record = recordsByUserId.get(user.id);
      const team = (record && assignmentsByPatientId.get(record.id)) || NO_STAFF;

      const profileStatus = record
        ? PROFILE_ACTIVE
        : inactiveProfileUserIds.includes(user.id)
          ? PROFILE_INACTIVE
          : PROFILE_MISSING;

      // An inactive profile is Inactive; without any profile the account's
      // own status is shown, as before.
      const isActive =
        profileStatus === PROFILE_INACTIVE
          ? false
          : record
            ? record.isActive
            : user.isActive;

      return {
        id: record?.id ?? null,
        userId: user.id,
        profileStatus,
        hasProfile: Boolean(record),
        userName: user.userName,
        medicalRecordNumber: record?.medicalRecordNumber ?? null,
        isActive,
        canAssign: Boolean(record) && Boolean(isActive),
        risk: record?.risk ?? null,
        assigned: {
          doctor: team.assignedDoctor.map((member) => member.userId),
          nurse: team.assignedNurses.map((member) => member.userId),
          caregiver: team.assignedCaregivers.map((member) => member.userId),
        },
        // userId -> assignmentId, needed to unassign that staff member.
        assignmentIds: Object.fromEntries(
          [
            ...team.assignedDoctor,
            ...team.assignedNurses,
            ...team.assignedCaregivers,
          ].map((member) => [member.userId, member.assignmentId]),
        ),
      };
    });
  }, [isReady, patientUsers, recordsByUserId, assignmentsByPatientId, inactiveProfileUserIds]);

  // Only active patients with a medical profile can receive a care team.
  const assignablePatients = useMemo(
    () => patients.filter((patient) => patient.canAssign),
    [patients],
  );

  const staffById = useMemo(
    () => Object.fromEntries(staff.map((member) => [member.id, member])),
    [staff],
  );

  const patientCountByStaff = useMemo(() => {
    const counts = {};

    patients.forEach((patient) => {
      ROLES.forEach((role) => {
        patient.assigned[role].forEach((id) => {
          counts[id] = (counts[id] ?? 0) + 1;
        });
      });
    });

    return counts;
  }, [patients]);

  const unassignedCount = useMemo(
    () => patients.filter(isUnassigned).length,
    [patients],
  );

  const filteredPatients = useMemo(() => {
    const term = search.trim().toLowerCase();

    const filtered = patients.filter((patient) => {
      if (staffFilter?.role === "unassigned") {
        if (!isUnassigned(patient)) return false;
      } else if (staffFilter) {
        if (!patient.assigned[staffFilter.role].includes(staffFilter.staffId)) {
          return false;
        }
      }

      if (!term) return true;

      return [patient.userName, patient.medicalRecordNumber].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(term),
      );
    });

    // Inactive patients always go last. Then by risk (Critical, High, Medium,
    // Stable, no risk); Array.sort is stable, so patients with the same risk
    // keep the order the backend returned.
    return filtered.sort(
      (a, b) => Number(!a.isActive) - Number(!b.isActive) || riskRank(a) - riskRank(b),
    );
  }, [patients, search, staffFilter]);

  // pairs = [{ patientId, userId }]. The store refreshes the list after a
  // success. When nothing succeeded (e.g. "already assigned") the list may be
  // out of date, so it is read again here, except after logout (store reset).
  const createAndSync = async (pairs) => {
    const result = await createAssignments(pairs);

    if (
      result.succeeded === 0 &&
      result.errors.length > 0 &&
      useAssignmentStore.getState().isLoaded
    ) {
      await fetchAssignments();
    }

    return result;
  };

  // Single-patient mode: one action, sent immediately.
  const assignStaff = (patientId, userId) => createAndSync([{ patientId, userId }]);
  const unassignStaff = (assignmentId) => deleteAssignments([assignmentId]);

  // Bulk mode: the (patient, staff) pairs that don't exist yet. Bulk only adds.
  // team = { doctor: [staffId], nurse: [staffId], caregiver: [staffId] }
  const getNewAssignments = (patientIds, team) => {
    const requested = ROLES.flatMap((role) => team[role]);

    return assignablePatients
      .filter((patient) => patientIds.includes(patient.id))
      .flatMap((patient) => {
        const existing = ROLES.flatMap((role) => patient.assigned[role]);

        return requested
          .filter((userId) => !existing.includes(userId))
          .map((userId) => ({ patientId: patient.id, userId }));
      });
  };

  const clearFilters = () => {
    setSearch("");
    setStaffFilter(null);
  };

  return {
    patients,
    assignablePatients,
    filteredPatients,
    staff,
    staffById,
    patientCountByStaff,
    unassignedCount,
    isLoading,
    error,
    fetchPatients: fetchAll,
    isAssigning,
    search,
    setSearch,
    staffFilter,
    setStaffFilter,
    hasFilters: search.trim() !== "" || staffFilter !== null,
    clearFilters,
    assignStaff,
    unassignStaff,
    getNewAssignments,
    createAssignments: createAndSync,
  };
}
