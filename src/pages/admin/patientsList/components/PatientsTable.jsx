import AssignedToCell from "./AssignedToCell";
import RiskBadge from "../../../../components/patients/RiskBadge";
import getInitials from "../../../../components/patients/getInitials";

const GRID =
  "grid grid-cols-[minmax(220px,2fr)_minmax(220px,2.2fr)_minmax(90px,0.8fr)_minmax(100px,0.8fr)_minmax(90px,0.7fr)_minmax(90px,0.7fr)] items-center gap-4 px-6";

const StatusBadge = ({ isActive }) => (
  <span className="inline-flex items-center gap-2 text-xs text-ink-soft">
    <span
      className={`h-2 w-2 rounded-full ${
        isActive ? "bg-success" : "bg-danger"
      }`}
    />

    {isActive ? "Active" : "Inactive"}
  </span>
);

const Message = ({ title, text, actionLabel, onAction }) => (
  <div className="border-t border-line-soft px-6 py-14 text-center">
    <p className="text-sm font-semibold text-ink">{title}</p>

    {text && <p className="mt-1 text-sm text-muted-strong">{text}</p>}

    {actionLabel && (
      <button
        type="button"
        onClick={onAction}
        className="mt-5 rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-surface-soft"
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
        className={`${GRID} animate-pulse border-t border-line-soft py-5`}
      >
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-surface-muted" />

          <div className="space-y-2">
            <div className="h-3 w-28 rounded bg-surface-muted" />
            <div className="h-2.5 w-20 rounded bg-surface-muted" />
          </div>
        </div>

        <div className="h-3 w-40 rounded bg-surface-muted" />
        <div className="h-5 w-16 rounded-full bg-surface-muted" />
        <div className="h-3 w-16 rounded bg-surface-muted" />
        <div className="h-3 w-10 rounded bg-surface-muted" />
        <div className="h-8 w-16 rounded-xl bg-surface-muted" />
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
  onView,
  onAssign,
}) => (
  <section className="overflow-hidden rounded-2xl border border-line bg-white">
    <div className="overflow-x-auto">
      <div className="min-w-[960px]">
        <div
          className={`${GRID} py-4 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-strong`}
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
              key={patient.userId}
              className={`${GRID} border-t border-line-soft py-4`}
            >
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-avatar text-xs font-bold text-on-avatar">
                  {getInitials(patient.name)}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">
                    {patient.name}
                  </p>

                  <p className="truncate text-xs text-muted">
                    {patient.medicalRecordNumber ||
                      (patient.hasProfile
                        ? "—"
                        : patient.profileStatus === "inactive"
                          ? "Inactive profile"
                          : "No medical profile")}
                  </p>
                </div>
              </div>

              <AssignedToCell
                assigned={patient.assigned}
                staffById={staffById}
              />

              <RiskBadge risk={patient.risk} />

              <StatusBadge isActive={patient.isActive} />

              <button
                type="button"
                onClick={() => onView(patient)}
                disabled={patient.profileStatus === "inactive"}
                title={
                  patient.profileStatus === "inactive"
                    ? "This patient is inactive"
                    : undefined
                }
                className="-mx-3 -my-1.5 w-fit rounded-lg px-3 py-1.5 text-sm font-semibold text-accent transition hover:bg-accent-soft hover:text-accent-strong disabled:cursor-not-allowed disabled:text-disabled-text disabled:hover:bg-transparent disabled:hover:text-disabled-text"
              >
                View
              </button>

              <button
                type="button"
                onClick={() => onAssign(patient)}
                disabled={!patient.canAssign}
                title={
                  patient.canAssign
                    ? undefined
                    : !patient.isActive
                      ? "This patient is inactive"
                      : "Complete the patient account first"
                }
                className="w-fit rounded-xl border border-accent/40 bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-accent-soft disabled:cursor-not-allowed disabled:border-disabled disabled:text-disabled-text disabled:hover:bg-white"
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
