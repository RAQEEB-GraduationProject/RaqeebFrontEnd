import { useState } from "react";
import { Plus, Search, X } from "lucide-react";

import usePatientAssignments from "./hooks/usePatientAssignments";
import AssignDrawer from "./components/AssignDrawer";
import PatientsTable from "./components/PatientsTable";
import StaffFilter from "./components/StaffFilter";

const PatientsList = () => {
  const {
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
    hasFilters,
    clearFilters,
    assign,
  } = usePatientAssignments();

  // null = closed, { patient: null } = bulk, { patient } = locked to one row
  const [drawer, setDrawer] = useState(null);

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
        hasFilters={hasFilters}
        onClearFilters={clearFilters}
        onAssign={(patient) => setDrawer({ patient })}
      />

      {drawer && (
        <AssignDrawer
          key={drawer.patient?.id ?? "bulk"}
          lockedPatient={drawer.patient}
          patients={patients}
          staff={staff}
          staffById={staffById}
          onSave={assign}
          onClose={() => setDrawer(null)}
        />
      )}
    </div>
  );
};

export default PatientsList;
