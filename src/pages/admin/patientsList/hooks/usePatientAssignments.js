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

const hasRisk = (patient) => Boolean(String(patient.risk ?? "").trim());

const isUnassigned =(patient) =>
  ROLES.every((role) => patient.assigned[role].length === 0);

/*
  Adapts assignments (assignmentStore) to the shape the page components use:
  `assigned` holds staff userIds, resolved to names through `staffById`.
  Risk and active status are patient data, so they are joined in from
  patientStore (GET /Patients) by patientId instead of being duplicated.
*/
export default function usePatientAssignments() {
  const apiPatients = useAssignmentStore((state) => state.assignments);
  const isLoading = useAssignmentStore((state) => state.isLoading);
  const error = useAssignmentStore((state) => state.error);
  const fetchAssignments = useAssignmentStore((state) => state.fetchAssignments);
  const isAssigning = useAssignmentStore((state) => state.isAssigning);
  const saveChanges = useAssignmentStore((state) => state.saveChanges);

  // Loading/error follow the assignments (the list this page is built from);
  // a failed patient-records request only leaves risk/status blank.
  const patientRecords = usePatientStore((state) => state.patients);
  const fetchPatientRecords = usePatientStore((state) => state.fetchPatients);

  const users = useUserStore((state) => state.users);
  const fetchUsers = useUserStore((state) => state.fetchUsers);

  useEffect(() => {
    fetchAssignments();
    fetchPatientRecords();
    fetchUsers();
  }, [fetchAssignments, fetchPatientRecords, fetchUsers]);

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

  const recordsById = useMemo(
    () => new Map(patientRecords.map((record) => [record.id, record])),
    [patientRecords],
  );

  const patients = useMemo(
    () =>
      apiPatients.map((patient) => {
        const record = recordsById.get(patient.patientId);

        return {
          id: patient.patientId,
          userName: patient.patientName,
          medicalRecordNumber: patient.patientCode,
          // Both endpoints only list active patients, so a missing record
          // means "not loaded yet", not "inactive".
          isActive: record?.isActive ?? true,
          risk: record?.risk ?? null,
          assigned: {
            doctor: patient.assignedDoctor.map((member) => member.userId),
            nurse: patient.assignedNurses.map((member) => member.userId),
            caregiver: patient.assignedCaregivers.map((member) => member.userId),
          },
          // userId -> assignmentId, needed to unassign that staff member.
          assignmentIds: Object.fromEntries(
            [
              ...patient.assignedDoctor,
              ...patient.assignedNurses,
              ...patient.assignedCaregivers,
            ].map((member) => [member.userId, member.assignmentId]),
          ),
        };
      }),
    [apiPatients, recordsById],
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

    // Patients without a risk level go last; Array.sort is stable, so the
    // order among each group stays as the backend returned it.
    return filtered.sort((a, b) => hasRisk(b) - hasRisk(a));
  }, [patients, search, staffFilter]);

  // team = { doctor: [staffId], nurse: [staffId], caregiver: [staffId] }
  // Creates one assignment per (patient, staff) pair that doesn't exist yet.
  // With removeMissing (single-patient edit only, where the drawer starts from
  // the current team), staff taken off the team are unassigned.
  const assign = async (patientIds, team, { removeMissing = false } = {}) => {
    const requested = ROLES.flatMap((role) => team[role]);
    const selected = patients.filter((patient) => patientIds.includes(patient.id));

    const create = selected.flatMap((patient) => {
      const existing = ROLES.flatMap((role) => patient.assigned[role]);

      return requested
        .filter((userId) => !existing.includes(userId))
        .map((userId) => ({ patientId: patient.id, userId }));
    });

    const remove = removeMissing
      ? selected.flatMap((patient) =>
          ROLES.flatMap((role) => patient.assigned[role])
            .filter((userId) => !requested.includes(userId))
            .map((userId) => patient.assignmentIds[userId])
            .filter(Boolean),
        )
      : [];

    if (create.length === 0 && remove.length === 0) {
      return { succeeded: 0, errors: [], nothingToDo: true };
    }

    return saveChanges({ create, remove });
  };

  const clearFilters = () => {
    setSearch("");
    setStaffFilter(null);
  };

  return {
    patients,
    filteredPatients,
    staff,
    staffById,
    patientCountByStaff,
    unassignedCount,
    isLoading,
    error,
    fetchPatients: fetchAssignments,
    isAssigning,
    search,
    setSearch,
    staffFilter,
    setStaffFilter,
    hasFilters: search.trim() !== "" || staffFilter !== null,
    clearFilters,
    assign,
  };
}
