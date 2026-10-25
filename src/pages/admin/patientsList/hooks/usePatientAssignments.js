import { useEffect, useMemo, useState } from "react";

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
  Adapts GET /Patients/assignments to the shape the page components use:
  `assigned` holds staff userIds, resolved to names through `staffById`.
  Re-assigning is still local-only (no save endpoint yet), kept as overrides.
*/
export default function usePatientAssignments() {
  const apiPatients = usePatientStore((state) => state.patients);
  const isLoading = usePatientStore((state) => state.isLoading);
  const error = usePatientStore((state) => state.error);
  const fetchPatients = usePatientStore((state) => state.fetchPatients);
  const isAssigning = usePatientStore((state) => state.isAssigning);
  const createAssignments = usePatientStore((state) => state.createAssignments);

  const users = useUserStore((state) => state.users);
  const fetchUsers = useUserStore((state) => state.fetchUsers);

  useEffect(() => {
    fetchPatients();
    fetchUsers();
  }, [fetchPatients, fetchUsers]);

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

  const patients = useMemo(
    () =>
      apiPatients.map((patient) => ({
        id: patient.patientId,
        userName: patient.patientName,
        medicalRecordNumber: patient.patientCode,
        isActive: patient.status?.toLowerCase() === "active",
        risk: patient.riskLevel,
        assigned: {
          doctor: patient.assignedDoctor.map((member) => member.userId),
          nurse: patient.assignedNurses.map((member) => member.userId),
          caregiver: patient.assignedCaregivers.map((member) => member.userId),
        },
      })),
    [apiPatients],
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
  // The backend has no endpoint to remove an assignment, so staff taken off
  // the team in the drawer are not unassigned.
  const assign = async (patientIds, team) => {
    const requested = ROLES.flatMap((role) => team[role]);

    const pairs = patients
      .filter((patient) => patientIds.includes(patient.id))
      .flatMap((patient) => {
        const existing = ROLES.flatMap((role) => patient.assigned[role]);

        return requested
          .filter((userId) => !existing.includes(userId))
          .map((userId) => ({ patientId: patient.id, userId }));
      });

    if (pairs.length === 0) {
      return { succeeded: 0, errors: [], nothingToDo: true };
    }

    return createAssignments(pairs);
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
    fetchPatients,
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
