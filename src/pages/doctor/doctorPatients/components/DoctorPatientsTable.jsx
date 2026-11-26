import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import RiskBadge from "../../../../components/patients/RiskBadge";
import { RISK_AVATAR_STYLES } from "../../../../components/patients/riskStyles";
import getInitials from "../../../../components/patients/getInitials";

const GRID =
  "grid grid-cols-[minmax(220px,2fr)_minmax(160px,1.4fr)_minmax(160px,1.4fr)_minmax(110px,0.9fr)_minmax(120px,1fr)_24px] items-center gap-4 px-6";

const SkeletonRows = () => (
  <div aria-busy="true" aria-label="Loading patients">
    {Array.from({ length: 5 }).map((_, index) => (
      <div
        key={index}
        className={`${GRID} animate-pulse border-t border-line-soft py-5`}
      >
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 rounded-full bg-surface-muted" />
          <div className="space-y-2">
            <div className="h-3 w-28 rounded bg-surface-muted" />
            <div className="h-2.5 w-20 rounded bg-surface-muted" />
          </div>
        </div>
        <div className="h-3 w-32 rounded bg-surface-muted" />
        <div className="h-3 w-32 rounded bg-surface-muted" />
        <div className="h-5 w-16 rounded-full bg-surface-muted" />
        <div className="h-3 w-16 rounded bg-surface-muted" />
        <span />
      </div>
    ))}
  </div>
);

// `patientsPath`: the role's patients route; rows open `${patientsPath}/:id`.
const DoctorPatientsTable = ({
  patients,
  isLoading,
  error,
  onRetry,
  hasFilters,
  onClearFilters,
  patientsPath = "/doctor/patients",
}) => {
  const navigate = useNavigate();
  const openPatient = (patient) => navigate(`${patientsPath}/${patient.id}`);

  return (
    <section className="overflow-hidden rounded-3xl border border-line-soft bg-white shadow-sm">
      <div className="overflow-x-auto">
        <div className="min-w-[860px]">
          <div
            className={`${GRID} py-5 text-[11px] font-medium uppercase tracking-[0.1em] text-muted`}
          >
            <span>Patient</span>
            <span>Diagnosis</span>
            <span>Treatment</span>
            <span>Risk level</span>
            <span>Last activity</span>
            <span />
          </div>

          {isLoading ? (
            <SkeletonRows />
          ) : error ? (
            <div className="border-t border-line-soft px-6 py-14 text-center">
              <p className="text-sm font-semibold text-ink">
                Couldn't load patients
              </p>
              <p className="mt-1 text-sm text-muted-strong">{error}</p>
              <button
                type="button"
                onClick={onRetry}
                className="mt-5 rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold text-accent transition hover:bg-surface-soft"
              >
                Try again
              </button>
            </div>
          ) : patients.length === 0 ? (
            <div className="border-t border-line-soft px-6 py-14 text-center">
              <p className="text-sm font-semibold text-ink">
                {hasFilters
                  ? "No patients match your filters"
                  : "No patients yet"}
              </p>
              <p className="mt-1 text-sm text-muted-strong">
                {hasFilters
                  ? "Try a different search or clear the filters."
                  : "Patients assigned to you will appear here."}
              </p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="mt-5 rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold text-accent transition hover:bg-surface-soft"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            patients.map((patient) => (
              <div
                key={patient.id}
                role="link"
                tabIndex={0}
                onClick={() => openPatient(patient)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openPatient(patient);
                  }
                }}
                className={`${GRID} cursor-pointer border-t border-line-soft py-5 transition hover:bg-surface-soft focus:bg-surface-soft focus:outline-none`}
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      RISK_AVATAR_STYLES[patient.risk] ??
                      "bg-surface-muted text-ink-soft"
                    }`}
                  >
                    {getInitials(patient.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">
                      {patient.name}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {patient.medicalRecordNumber || "—"}
                    </p>
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">
                    {patient.diagnosis || "—"}
                  </p>
                  <p className="text-xs text-muted">
                    {patient.stage || "—"}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">
                    {patient.treatment || "—"}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {patient.protocol || "—"}
                  </p>
                </div>

                <RiskBadge risk={patient.risk} />

                <p className="text-sm text-ink-soft">
                  —
                </p>

                <ChevronRight
                  size={18}
                  className="text-muted"
                  aria-hidden="true"
                />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default DoctorPatientsTable;
