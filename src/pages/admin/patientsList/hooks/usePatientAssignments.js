import { useEffect, useMemo, useState } from "react";

import { usePatientStore } from "../../../../store/patientStore";

const ROLES = ["doctor", "nurse", "caregiver"];

// API field that holds each role's assigned staff.
const ROLE_FIELDS = {
  doctor: "assignedDoctor",
  nurse: "assignedNurses",
  caregiver: "assignedCaregivers",
};

const isUnassigned = (patient) =>
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

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // patientId -> team saved locally from the Assign drawer
  const [overrides, setOverrides] = useState({});

  const [search, setSearch] = useState("");
  // { role: "doctor" | "nurse" | "caregiver", staffId } | { role: "unassigned" } | null
  const [staffFilter, setStaffFilter] = useState(null);

  // The API has no staff list endpoint yet, so staff are the people that
  // appear in the assignments returned for the patients.
  const staff = useMemo(() => {
    const byId = new Map();

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
  }, [apiPatients]);

  const patients = useMemo(
    () =>
      apiPatients.map((patient) => ({
        id: patient.patientId,
        userName: patient.patientName,
        medicalRecordNumber: patient.patientCode,
        isActive: patient.status?.toLowerCase() === "active",
        risk: patient.riskLevel,
        assigned: overrides[patient.patientId] ?? {
          doctor: patient.assignedDoctor.map((member) => member.userId),
          nurse: patient.assignedNurses.map((member) => member.userId),
          caregiver: patient.assignedCaregivers.map((member) => member.userId),
        },
      })),
    [apiPatients, overrides],
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

    return patients.filter((patient) => {
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
  }, [patients, search, staffFilter]);

  // team = { doctor: [staffId], nurse: [staffId], caregiver: [staffId] }
  const assign = (patientIds, team) => {
    // TODO: replace with API when backend is ready (save care team assignments)
    setOverrides((current) => {
      const next = { ...current };

      patientIds.forEach((id) => {
        next[id] = {
          doctor: [...team.doctor],
          nurse: [...team.nurse],
          caregiver: [...team.caregiver],
        };
      });

      return next;
    });
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
    search,
    setSearch,
    staffFilter,
    setStaffFilter,
    hasFilters: search.trim() !== "" || staffFilter !== null,
    clearFilters,
    assign,
  };
}
