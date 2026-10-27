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
        className={`${GRID} animate-pulse border-t border-slate-100 py-5`}
      >
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 rounded-full bg-slate-100" />
          <div className="space-y-2">
            <div className="h-3 w-28 rounded bg-slate-100" />
            <div className="h-2.5 w-20 rounded bg-slate-100" />
          </div>
        </div>
        <div className="h-3 w-32 rounded bg-slate-100" />
        <div className="h-3 w-32 rounded bg-slate-100" />
        <div className="h-5 w-16 rounded-full bg-slate-100" />
        <div className="h-3 w-16 rounded bg-slate-100" />
        <span />
      </div>
    ))}
  </div>
);

const DoctorPatientsTable = ({
  patients,
  isLoading,
  error,
  onRetry,
  hasFilters,
  onClearFilters,
}) => {
  const navigate = useNavigate();
  const openPatient = (patient) => navigate(`/doctor/patients/${patient.id}`);

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <div className="min-w-[860px]">
          <div
            className={`${GRID} py-5 text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400`}
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
            <div className="border-t border-slate-100 px-6 py-14 text-center">
              <p className="text-sm font-semibold text-slate-800">
                Couldn't load patients
              </p>
              <p className="mt-1 text-sm text-slate-500">{error}</p>
              <button
                type="button"
                onClick={onRetry}
                className="mt-5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-[#3f5ea8] transition hover:bg-slate-50"
              >
                Try again
              </button>
            </div>
          ) : patients.length === 0 ? (
            <div className="border-t border-slate-100 px-6 py-14 text-center">
              <p className="text-sm font-semibold text-slate-800">
                {hasFilters
                  ? "No patients match your filters"
                  : "No patients yet"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {hasFilters
                  ? "Try a different search or clear the filters."
                  : "Patients assigned to you will appear here."}
              </p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="mt-5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-[#3f5ea8] transition hover:bg-slate-50"
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
                className={`${GRID} cursor-pointer border-t border-slate-100 py-5 transition hover:bg-slate-50 focus:bg-slate-50 focus:outline-none`}
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      RISK_AVATAR_STYLES[patient.risk] ??
                      "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {getInitials(patient.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {patient.name}
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      {patient.medicalRecordNumber || "—"}
                    </p>
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {patient.diagnosis || "—"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {patient.stage || "—"}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {patient.treatment || "—"}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {patient.protocol || "—"}
                  </p>
                </div>

                <RiskBadge risk={patient.risk} />

                <p className="text-sm text-slate-600">
                  —
                </p>

                <ChevronRight
                  size={18}
                  className="text-slate-400"
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
