import { useState } from "react";

import DiagnosticFileActions from "./DiagnosticFileActions";
import DiagnosticsSection, { SelectField } from "./DiagnosticsSection";
import {
  LAB_FLAGS,
  SORT_NEWEST,
  formatDiagnosticDate,
  getFlagStyle,
  searchAndSort,
} from "./diagnosticsHelpers";
import usePatientDiagnosticList from "./usePatientDiagnosticList";

const ALL = "all";

const FlagBadge = ({ flag, label = flag ?? "No flag" }) => (
  <span
    className={`inline-flex shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${getFlagStyle(flag)}`}
  >
    {label}
  </span>
);

const LabResult = ({ result }) => (
  <>
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="break-words text-sm font-semibold text-ink">{result.testName}</p>
        <p className="mt-1 break-words text-lg font-semibold text-ink">
          {result.value ?? "—"}
          {result.unit && (
            <span className="ml-1.5 text-xs font-normal text-muted-strong">{result.unit}</span>
          )}
        </p>
        <p className="mt-1 text-xs text-muted">
          {formatDiagnosticDate(result.recordedAt) ?? "Date not recorded"}
        </p>
      </div>
      <FlagBadge flag={result.flag} />
    </div>

    <DiagnosticFileActions record={result} recordName={result.testName} />
  </>
);

// How many results carry each flag, exactly as returned.
const FlagCounts = ({ results }) => {
  const counts = [...LAB_FLAGS, null]
    .map((flag) => ({
      flag,
      count: results.filter((result) =>
        flag ? result.flag === flag : !LAB_FLAGS.includes(result.flag),
      ).length,
    }))
    .filter(({ count }) => count > 0);

  return (
    <ul className="flex flex-wrap justify-center gap-2">
      {counts.map(({ flag, count }) => (
        <li key={flag ?? "other"}>
          <FlagBadge flag={flag} label={`${flag ?? "Other / no flag"}: ${count}`} />
        </li>
      ))}
    </ul>
  );
};

const LabResultsSection = ({ patientId, patientName }) => {
  const list = usePatientDiagnosticList("labs", patientId);
  const [search, setSearch] = useState("");
  const [flag, setFlag] = useState(ALL);
  const [sort, setSort] = useState(SORT_NEWEST);

  const items = list.items ?? [];
  const records = searchAndSort(
    flag === ALL ? items : items.filter((result) => result.flag === flag),
    { search, sort, nameKey: "testName", dateKey: "recordedAt" },
  );

  return (
    <DiagnosticsSection
      title="Lab Results"
      patientName={patientName}
      loadingText="Loading lab results…"
      errorTitle="Couldn't load the lab results"
      emptyText="No laboratory results available."
      searchLabel="Search by test name"
      list={list}
      records={records}
      renderRecord={(result) => <LabResult result={result} />}
      search={search}
      onSearch={setSearch}
      sort={sort}
      onSort={setSort}
      onClearFilters={() => {
        setSearch("");
        setFlag(ALL);
      }}
      filters={
        <SelectField label="Filter lab results by status" value={flag} onChange={setFlag}>
          <option value={ALL}>All statuses</option>
          {LAB_FLAGS.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </SelectField>
      }
      summary={<FlagCounts results={items} />}
    />
  );
};

export default LabResultsSection;
