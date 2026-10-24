import { ChevronRight } from "lucide-react";
import RiskBadge from "../../../../components/patients/RiskBadge";
import getInitials from "../../../../components/patients/getInitials";

const GRID =
  "grid grid-cols-[minmax(220px,2fr)_minmax(160px,1.4fr)_minmax(160px,1.4fr)_minmax(110px,0.9fr)_minmax(120px,1fr)_24px] items-center gap-4 px-6";

const AVATAR_STYLES = {
  Critical: "bg-rose-50 text-rose-700",
  High: "bg-orange-50 text-orange-700",
  Medium: "bg-indigo-50 text-indigo-700",
  Stable: "bg-emerald-50 text-emerald-700",
};

const DoctorPatientsTable = ({ patients, hasFilters, onClearFilters }) => (
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

        {patients.length === 0 ? (
          <div className="border-t border-slate-100 px-6 py-14 text-center">
            <p className="text-sm font-semibold text-slate-800">
              {hasFilters ? "No patients match your filters" : "No patients yet"}
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
              className={`${GRID} border-t border-slate-100 py-5`}
            >
              <div className="flex min-w-0 items-center gap-4">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    AVATAR_STYLES[patient.risk] ?? "bg-slate-100 text-slate-600"
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
                  {patient.diagnosis?.type || "—"}
                </p>
                <p className="text-xs text-slate-400">
                  {patient.diagnosis?.stage || "—"}
                </p>
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {patient.treatment
                    ? `Cycle ${patient.treatment.cycle} of ${patient.treatment.totalCycles}`
                    : "—"}
                </p>
                <p className="truncate text-xs text-slate-400">
                  {patient.treatment?.protocol || "—"}
                </p>
              </div>

              <RiskBadge risk={patient.risk} />

              <p className="text-sm text-slate-600">
                {patient.lastActivity || "—"}
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

export default DoctorPatientsTable;
