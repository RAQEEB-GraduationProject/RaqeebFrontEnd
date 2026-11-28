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

// Resolves true only when the Admin confirms. `text` is plain text, so names
// need no escaping.
const confirmAction = async ({ title, text, isRemoval = false }) => {
  const { isConfirmed } = await Swal.fire({
    icon: isRemoval ? "warning" : "question",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: "Confirm",
    cancelButtonText: "Cancel",
    focusCancel: isRemoval,
    customClass: isRemoval ? { confirmButton: "swal-danger" } : {},
  });

  return isConfirmed;
};

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
    assignStaff,
    unassignStaff,
    getNewAssignments,
    createAssignments,
  } = usePatientAssignments();

  const staffName = (userId) => staffById[userId]?.name ?? "this user";

  /* Single-patient mode: each action is confirmed, then saved immediately. */

  const handleAdd = async (patient, userId) => {
    const name = staffName(userId);
    const confirmed = await confirmAction({
      title: "Confirm assignment",
      text: `Are you sure you want to assign ${name} to this patient?`,
    });

    if (!confirmed) return;

    const { errors } = await assignStaff(patient.id, userId);

    if (errors.length > 0) notify("error", errors.join(" "));
    else notify("success", `${name} assigned`);
  };

  const handleRemove = async (patient, userId) => {
    const name = staffName(userId);
    const confirmed = await confirmAction({
      title: "Confirm removal",
      text: `Are you sure you want to remove ${name} from this patient?`,
      isRemoval: true,
    });

    if (!confirmed) return;

    const { errors } = await unassignStaff(patient.assignmentIds[userId]);

    if (errors.length > 0) notify("error", errors.join(" "));
    else notify("success", `${name} removed`);
  };

  /*
    Bulk mode: the selections are temporary until this one confirmation.
    Resolves true when the drawer can close (everything saved).
  */
  const handleBulkSubmit = async (patientIds, team) => {
    const pairs = getNewAssignments(patientIds, team);

    if (pairs.length === 0) {
      notify("info", "The selected staff are already assigned to these patients");
      return false;
    }

    const staffNames = Object.values(team).flat().map(staffName).join(", ");
    const patientNames = assignablePatients
      .filter((patient) => patientIds.includes(patient.id))
      .map((patient) => patient.name)
      .join(", ");

    const confirmed = await confirmAction({
      title: "Confirm bulk assignment",
      text:
        `Are you sure you want to assign ${staffNames} to ${patientNames}? ` +
        `New assignments: ${pairs.length}. Existing assignments are kept.`,
    });

    if (!confirmed) return false;

    const { succeeded, errors } = await createAssignments(pairs);

    if (errors.length === 0) {
      notify("success", `${succeeded} assigned`);
      return true;
    }

    notify(
      "error",
      succeeded > 0
        ? `Some assignments failed: ${errors.join(" ")}`
        : errors.join(" "),
    );

    return false;
  };

  // null = closed, { patient: null } = bulk, { patient } = locked to one row
  const [drawer, setDrawer] = useState(null);

  // The open row as it is saved now, so the drawer follows every change.
  const drawerPatient =
    drawer?.patient &&
    (patients.find((patient) => patient.userId === drawer.patient.userId) ??
      drawer.patient);

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
          <h1 className="text-4xl font-medium text-ink">
            Patients &amp; assignments
          </h1>

          <p className="mt-2 text-sm text-muted-strong">
            Manage monitored patients and their assigned care teams.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setDrawer({ patient: null })}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-on-primary transition hover:bg-primary-hover"
        >
          <Plus size={18} />
          Assign
        </button>
      </header>

      {/* Search + staff filter */}
      <section className="rounded-2xl border border-line bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            />

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient name or ID…"
              aria-label="Search patients"
              className="w-full rounded-xl border border-field bg-white py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-muted focus:border-focus focus:ring-2 focus:ring-focus/25"
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
          className="rounded-xl bg-danger-bg px-4 py-3 text-sm text-danger-text"
        >
          {error}
        </p>
      )}

      {/* Count + active filter chip */}
      <div className="-mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-strong">
        <p>
          <span className="font-bold">{filteredPatients.length}</span>{" "}
          {filteredPatients.length === 1 ? "patient" : "patients"}
        </p>

        {filterLabel && (
          <span className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-strong">
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
            className="font-semibold text-accent hover:text-accent-strong"
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
          lockedPatient={drawerPatient}
          patients={assignablePatients}
          staff={staff}
          staffById={staffById}
          isSaving={isAssigning}
          onAdd={(userId) => handleAdd(drawerPatient, userId)}
          onRemove={(userId) => handleRemove(drawerPatient, userId)}
          onBulkSubmit={handleBulkSubmit}
          onClose={() => setDrawer(null)}
        />
      )}
    </div>
  );
};

export default PatientsList;
