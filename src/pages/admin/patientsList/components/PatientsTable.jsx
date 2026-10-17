import AssignedToCell from "./AssignedToCell";
import RiskBadge from "../../../../components/patients/RiskBadge";
import getInitials from "../../../../components/patients/getInitials";

const GRID =
  "grid grid-cols-[minmax(220px,2fr)_minmax(220px,2.2fr)_minmax(90px,0.8fr)_minmax(100px,0.8fr)_minmax(90px,0.7fr)_minmax(90px,0.7fr)] items-center gap-4 px-6";

const StatusBadge = ({ isActive }) => (
  <span className="inline-flex items-center gap-2 text-xs text-slate-600">
    <span
      className={`h-2 w-2 rounded-full ${
        isActive ? "bg-emerald-500" : "bg-rose-500"
      }`}
    />

    {isActive ? "Active" : "Inactive"}
  </span>
);

const Message = ({ title, text, actionLabel, onAction }) => (
  <div className="border-t border-slate-100 px-6 py-14 text-center">
    <p className="text-sm font-semibold text-[#0b2a3d]">{title}</p>

    {text && <p className="mt-1 text-sm text-slate-500">{text}</p>}

    {actionLabel && (
      <button
        type="button"
        onClick={onAction}
        className="mt-5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-[#0f3d4c] transition hover:bg-slate-50"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

const PatientsTable = ({
  patients,
  staffById,
  hasFilters,
  onClearFilters,
  onAssign,
}) => (
  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div className="overflow-x-auto">
      <div className="min-w-[960px]">
        <div
          className={`${GRID} py-4 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500`}
        >
          <span>Patient</span>
          <span>Assigned to</span>
          <span>Risk</span>
          <span>Status</span>
          <span>Details</span>
          <span>Assign</span>
        </div>

        {patients.length === 0 ? (
          <Message
            title={
              hasFilters ? "No patients match your filters" : "No patients yet"
            }
            text={
              hasFilters
                ? "Try a different search or clear the filters."
                : "Patients added to the hospital will appear here."
            }
            actionLabel={hasFilters ? "Clear filters" : undefined}
            onAction={onClearFilters}
          />
        ) : (
          patients.map((patient) => (
            <div
              key={patient.id}
              className={`${GRID} border-t border-slate-100 py-4`}
            >
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-xs font-bold text-teal-800">
                  {getInitials(patient.userName)}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#0b2a3d]">
                    {patient.userName || "—"}
                  </p>

                  <p className="truncate text-xs text-slate-400">
                    {patient.medicalRecordNumber || "—"}
                  </p>
                </div>
              </div>

              <AssignedToCell
                assigned={patient.assigned}
                staffById={staffById}
              />

              <RiskBadge risk={patient.risk} />

              <StatusBadge isActive={patient.isActive} />

              {/* TODO: open patient details (details UI/page not built yet) */}
              <button
                type="button"
                className="w-fit text-sm font-semibold text-teal-700 transition hover:text-teal-900"
              >
                View
              </button>

              <button
                type="button"
                onClick={() => onAssign(patient)}
                className="w-fit rounded-xl border border-teal-700/40 bg-white px-4 py-2 text-sm font-semibold text-[#0f3d4c] transition hover:bg-teal-50"
              >
                Assign
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  </section>
);

export default PatientsTable;
