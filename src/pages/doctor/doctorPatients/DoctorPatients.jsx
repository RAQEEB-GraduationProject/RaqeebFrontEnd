import { ChevronDown, Search } from "lucide-react";
import PageHeading from "../../../components/profile/PageHeading";
import useDoctorPatients, {
  RISK_FILTERS,
  TAB_ALL,
  TAB_PRIORITY,
} from "./hooks/useDoctorPatients";
import DoctorPatientsTable from "./components/DoctorPatientsTable";

const TABS = [
  { key: TAB_PRIORITY, label: "Priority Queue" },
  { key: TAB_ALL, label: "All Patients" },
];

const selectClass =
  "w-full appearance-none rounded-xl border border-field bg-white py-3 pl-4 pr-10 text-sm font-medium text-ink-soft outline-none transition focus:border-focus focus:ring-2 focus:ring-focus/25";

const SelectField = ({ label, value, onChange, children }) => (
  <div className="relative sm:w-44">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className={selectClass}
    >
      {children}
    </select>
    <ChevronDown
      size={16}
      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
    />
  </div>
);

// Clinical patient list (GET /Patients: the backend returns only the patients
// assigned to the signed-in doctor or nurse). Also used by the nurse route:
// pass `patientsPath="/nurse/patients"` so rows open the nurse's details page.
const DoctorPatients = ({ patientsPath = "/doctor/patients" }) => {
  const {
    filteredPatients,
    isLoading,
    error,
    refetch,
    cycleOptions,
    riskCounts,
    search,
    setSearch,
    risk,
    setRisk,
    cycle,
    setCycle,
    tab,
    setTab,
    hasFilters,
    clearFilters,
  } = useDoctorPatients();

  const count = filteredPatients.length;
  const listTitle = TABS.find((t) => t.key === tab).label;

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div role="tablist" className="flex gap-8 border-b border-line">
        {TABS.map(({ key, label }) => {
          const active = key === tab;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(key)}
              className={`-mb-px border-b-2 pb-3 text-sm font-medium transition ${
                active
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-strong hover:text-ink"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <PageHeading
        title={listTitle}
        description="Monitor patient status, treatment progress and clinical risk."
      />

      {/* Search + filters */}
      <section className="rounded-2xl border border-line-soft bg-white p-4 shadow-sm">
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

          <SelectField label="Filter by risk" value={risk} onChange={setRisk}>
            <option value="all">All risks</option>
            {RISK_FILTERS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Filter by treatment cycle"
            value={cycle}
            onChange={setCycle}
          >
            <option value="all">Treatment cycle</option>
            {cycleOptions.map((n) => (
              <option key={n} value={n}>
                Cycle {n}
              </option>
            ))}
          </SelectField>
        </div>
      </section>

      {/* Summary */}
      <div className="-mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-strong">
          <span className="font-semibold text-ink">{listTitle}</span> ·{" "}
          {count} patient {count === 1 ? "record" : "records"} shown
        </p>

        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          {["Critical", "High"].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setRisk(risk === level ? "all" : level)}
              aria-pressed={risk === level}
              className={`rounded-full px-3 py-1 transition ${
                level === "Critical"
                  ? "bg-risk-critical-bg text-risk-critical-text"
                  : "bg-risk-high-bg text-risk-high-text"
              } ${risk === level ? "ring-2 ring-current/30" : ""}`}
            >
              {riskCounts[level] ?? 0} {level}
            </button>
          ))}
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-full bg-accent-soft px-3 py-1 text-accent-strong"
            >
              Clear filter
            </button>
          )}
        </div>
      </div>

      <DoctorPatientsTable
        patients={filteredPatients}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        hasFilters={hasFilters}
        onClearFilters={clearFilters}
        patientsPath={patientsPath}
      />
    </div>
  );
};

export default DoctorPatients;
