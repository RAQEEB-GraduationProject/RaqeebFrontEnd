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

const SkeletonRows = () => (
  <div aria-busy="true" aria-label="Loading patients">
    {Array.from({ length: 5 }).map((_, index) => (
      <div
        key={index}
        className={`${GRID} animate-pulse border-t border-slate-100 py-5`}
      >
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-slate-100" />

          <div className="space-y-2">
            <div className="h-3 w-28 rounded bg-slate-100" />
            <div className="h-2.5 w-20 rounded bg-slate-100" />
          </div>
        </div>

        <div className="h-3 w-40 rounded bg-slate-100" />
        <div className="h-5 w-16 rounded-full bg-slate-100" />
        <div className="h-3 w-16 rounded bg-slate-100" />
        <div className="h-3 w-10 rounded bg-slate-100" />
        <div className="h-8 w-16 rounded-xl bg-slate-100" />
      </div>
    ))}
  </div>
);

const PatientsTable = ({
  patients,
  staffById,
  isLoading,
  error,
  onRetry,
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

        {isLoading ? (
          <SkeletonRows />
        ) : error ? (
          <Message
            title="Couldn't load patients"
            text={error}
            actionLabel="Try again"
            onAction={onRetry}
          />
        ) : patients.length === 0 ? (
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
