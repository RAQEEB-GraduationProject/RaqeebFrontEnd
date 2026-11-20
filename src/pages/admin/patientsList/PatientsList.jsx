import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, X } from "lucide-react";
import Swal from "sweetalert2";

import usePatientAssignments from "./hooks/usePatientAssignments";
import AssignDrawer from "./components/AssignDrawer";
import PatientsTable from "./components/PatientsTable";
import StaffFilter from "./components/StaffFilter";
import notify from "./notify";
import { patientUserPath } from "./patientPaths";

// Names go into the dialog's HTML, so escape them.
const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char],
  );

const PatientsList = () => {
  const navigate = useNavigate();

  const {
    patients,
    assignablePatients,
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
    hasFilters,
    clearFilters,
    assign,
  } = usePatientAssignments();

  // Resolves true when the drawer can close (everything saved, or nothing to save).
  const handleSave = async (patientIds, team) => {
    const isRowEdit = Boolean(drawer?.patient);

    // Taking someone off a team unassigns them, so confirm first.
    if (isRowEdit) {
      const removedNames = Object.entries(drawer.patient.assigned)
        .flatMap(([role, ids]) => ids.filter((id) => !team[role].includes(id)))
        .map((id) => staffById[id]?.name ?? "A staff member");

      if (removedNames.length > 0) {
        const { isConfirmed } = await Swal.fire({
          icon: "warning",
          title: "Unassign from this patient?",
          html:
            `<p><b>${removedNames.map(escapeHtml).join(", ")}</b> will no longer be ` +
            `assigned to <b>${escapeHtml(drawer.patient.userName)}</b>.</p>` +
            `<p style="margin-top:8px">Their account and their assignments to ` +
            `other patients are not affected. This ends only this assignment.</p>`,
          showCancelButton: true,
          confirmButtonText: "Yes, unassign",
        });

        if (!isConfirmed) return false;
      }
    }

    const { succeeded, errors, nothingToDo, created, removed } = await assign(
      patientIds,
      team,
      { removeMissing: isRowEdit },
    );

    if (nothingToDo) {
      notify("info", "No changes to save");
      return true;
    }

    if (errors.length === 0) {
      notify(
        "success",
        [
          created > 0 && `${created} assigned`,
          removed > 0 && `${removed} unassigned`,
        ]
          .filter(Boolean)
          .join(", "),
      );
      return true;
    }

    notify(
      "error",
      succeeded > 0
        ? `Some changes failed: ${errors.join(" ")}`
        : errors.join(" "),
    );

    return false;
  };

  // null = closed, { patient: null } = bulk, { patient } = locked to one row
  const [drawer, setDrawer] = useState(null);

  // With a profile: open its details. Without one: the "complete patient
  // account" page (the form is a separate page, see CompletePatientAccount).
  const handleView = (patient) => {
    navigate(
      patient.hasProfile
        ? `/admin/patients/${patient.id}`
        : patientUserPath(patient.userId),
    );
  };

  const filterLabel = !staffFilter
    ? null
    : staffFilter.role === "unassigned"
      ? "Unassigned patients"
      : `${staffFilter.role[0].toUpperCase()}${staffFilter.role.slice(1)}: ${
          staffById[staffFilter.staffId]?.name
        }`;

  return (
    <div className="space-y-8">
      {/* Heading */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-medium text-[#0b2a3d]">
            Patients &amp; assignments
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage monitored patients and their assigned care teams.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setDrawer({ patient: null })}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0f3d4c] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#0b2a3d]"
        >
          <Plus size={18} />
          Assign
        </button>
      </header>

      {/* Search + staff filter */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient name or ID…"
              aria-label="Search patients"
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
            />
          </div>

          <StaffFilter
            staff={staff}
            patientCountByStaff={patientCountByStaff}
            unassignedCount={unassignedCount}
            onChange={setStaffFilter}
          />
        </div>
      </section>

      {error && patients.length > 0 && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {error}
        </p>
      )}

      {/* Count + active filter chip */}
      <div className="-mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <p>
          <span className="font-bold">{filteredPatients.length}</span>{" "}
          {filteredPatients.length === 1 ? "patient" : "patients"}
        </p>

        {filterLabel && (
          <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-900">
            {filterLabel}

            <button
              type="button"
              aria-label="Remove staff filter"
              onClick={() => setStaffFilter(null)}
            >
              <X size={12} />
            </button>
          </span>
        )}

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="font-semibold text-teal-700 hover:text-teal-900"
          >
            Clear filters
          </button>
        )}
      </div>

      <PatientsTable
        patients={filteredPatients}
        staffById={staffById}
        isLoading={isLoading && patients.length === 0}
        error={patients.length === 0 ? error : null}
        onRetry={fetchPatients}
        hasFilters={hasFilters}
        onClearFilters={clearFilters}
        onView={handleView}
        onAssign={(patient) => setDrawer({ patient })}
      />

      {drawer && (
        <AssignDrawer
          key={drawer.patient?.id ?? "bulk"}
          lockedPatient={drawer.patient}
          patients={assignablePatients}
          staff={staff}
          staffById={staffById}
          isSaving={isAssigning}
          onSave={handleSave}
          onClose={() => setDrawer(null)}
        />
      )}
    </div>
  );
};

export default PatientsList;
