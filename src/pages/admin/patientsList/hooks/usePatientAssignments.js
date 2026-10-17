import { useMemo, useState } from "react";

import { mockPatients } from "../../../../data/mockPatients";
import { mockStaff } from "../../../../data/mockStaff";

const ROLES = ["doctor", "nurse", "caregiver"];

const isUnassigned = (patient) =>
  ROLES.every((role) => patient.assigned[role].length === 0);

/*
  Local-only state for the Patients & assignments page.
  TODO: replace with API when backend is ready — swap the mock data below
  for fetched data and make `assign` call the API.
  The components only use what this hook returns, so they won't change.
*/
export default function usePatientAssignments() {
  // TODO: replace with API when backend is ready (fetch patients)
  const [patients, setPatients] = useState(mockPatients);
  // TODO: replace with API when backend is ready (fetch staff)
  const staff = mockStaff;

  const [search, setSearch] = useState("");
  // { role: "doctor" | "nurse" | "caregiver", staffId } | { role: "unassigned" } | null
  const [staffFilter, setStaffFilter] = useState(null);

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

      return [patient.userName, patient.medicalRecordNumber, patient.email].some(
        (value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(term),
      );
    });
  }, [patients, search, staffFilter]);

  // team = { doctor: [staffId], nurse: [staffId], caregiver: [staffId] }
  const assign = (patientIds, team) => {
    // TODO: replace with API when backend is ready (save care team assignments)
    setPatients((current) =>
      current.map((patient) =>
        patientIds.includes(patient.id)
          ? {
              ...patient,
              assigned: {
                doctor: [...team.doctor],
                nurse: [...team.nurse],
                caregiver: [...team.caregiver],
              },
            }
          : patient,
      ),
    );
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
    search,
    setSearch,
    staffFilter,
    setStaffFilter,
    hasFilters: search.trim() !== "" || staffFilter !== null,
    clearFilters,
    assign,
  };
}
