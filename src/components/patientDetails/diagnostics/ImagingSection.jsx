import { useState } from "react";

import DiagnosticFileActions from "./DiagnosticFileActions";
import DiagnosticsSection from "./DiagnosticsSection";
import { SORT_NEWEST, formatDiagnosticDate, searchAndSort } from "./diagnosticsHelpers";
import usePatientDiagnosticList from "./usePatientDiagnosticList";

const ImagingRecord = ({ record }) => (
  <>
    <div className="min-w-0">
      <p className="break-words text-sm font-semibold text-ink">{record.studyName}</p>
      <p className="mt-1 text-xs text-muted">
        {formatDiagnosticDate(record.studyDate) ?? "Date not recorded"}
      </p>
    </div>

    <div className="rounded-xl bg-surface-soft px-4 py-4">
      <p className="text-xs text-muted">Findings</p>
      {record.finding ? (
        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-ink">
          {record.finding}
        </p>
      ) : (
        <p className="mt-1 text-sm text-muted">Not recorded</p>
      )}
    </div>

    <DiagnosticFileActions record={record} recordName={record.studyName} />
  </>
);

const ImagingSection = ({ patientId, patientName }) => {
  const list = usePatientDiagnosticList("imaging", patientId);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState(SORT_NEWEST);

  const records = searchAndSort(list.items ?? [], {
    search,
    sort,
    nameKey: "studyName",
    dateKey: "studyDate",
  });

  return (
    <DiagnosticsSection
      title="Imaging"
      patientName={patientName}
      loadingText="Loading imaging records…"
      errorTitle="Couldn't load the imaging records"
      emptyText="No imaging records available."
      searchLabel="Search by study name"
      list={list}
      records={records}
      renderRecord={(record) => <ImagingRecord record={record} />}
      search={search}
      onSearch={setSearch}
      sort={sort}
      onSort={setSort}
      onClearFilters={() => setSearch("")}
    />
  );
};

export default ImagingSection;
