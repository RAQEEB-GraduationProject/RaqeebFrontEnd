import { useState } from "react";
import { ChevronRight, Plus } from "lucide-react";

const Panel = ({ title, text, children }) => (
  <div className="rounded-2xl border border-slate-100 bg-white px-6 py-14 text-center shadow-sm">
    <p className="text-sm font-semibold text-slate-800">{title}</p>
    {text && <p className="mt-1 text-sm text-slate-500">{text}</p>}
    {children}
  </div>
);

const Row = ({ row, isOpen, onToggle }) => {
  const panelId = `care-row-${row.id}`;

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-4 px-0.5 py-5 text-left transition hover:bg-slate-50/60"
      >
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-slate-900">{row.title}</span>
          {row.subtitle && (
            <span className="mt-1 block truncate text-xs text-slate-400">{row.subtitle}</span>
          )}
        </span>

        <span className="flex shrink-0 items-center gap-4">
          {row.badge && (
            <span className="max-w-[180px] truncate rounded-full bg-[#eeeafb] px-3 py-1.5 text-xs font-semibold text-[#6c5ba8]">
              {row.badge}
            </span>
          )}
          <ChevronRight
            size={18}
            aria-hidden="true"
            className={`text-slate-500 transition ${isOpen ? "rotate-90" : ""}`}
          />
        </span>
      </button>

      {isOpen && (
        <div id={panelId} className="mb-5 rounded-xl bg-slate-50 px-4 py-4">
          {row.details}
        </div>
      )}
    </li>
  );
};

/*
  Layout shared by the Journal and Appointments sections (reference
  screenshots 095728 / 095741): heading + "Add entry", the records card with
  expandable rows, and the "At a glance" card with the backend's totalCount.
  `list` comes from usePatientCareList; `rows` are { id, title, subtitle,
  badge, details }. Export / Open care plan are not shown: no backend.
*/
const CareSection = ({
  title,
  patientName,
  glanceText,
  loadingText,
  errorTitle,
  emptyText,
  list,
  rows,
  canAdd,
  onAdd,
}) => {
  const [openId, setOpenId] = useState(null);
  const { items, totalCount, isLoading, error, retry } = list;

  let body;
  if (error) {
    body = (
      <Panel title={errorTitle} text={error}>
        <button
          type="button"
          onClick={retry}
          className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-[#3f5ea8] transition hover:bg-slate-50"
        >
          Try again
        </button>
      </Panel>
    );
  } else if (!items && isLoading) {
    body = (
      <div
        aria-busy="true"
        className="rounded-2xl border border-slate-100 bg-white px-6 py-14 text-center text-sm text-slate-500 shadow-sm"
      >
        {loadingText}
      </div>
    );
  } else if (!items) {
    body = <Panel title={emptyText} />;
  } else {
    body = (
      <div className="grid items-start gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-medium text-slate-900">{title} records</h3>
          <p className="mt-1 text-sm text-slate-400">Most recent clinical information</p>

          {rows.length === 0 ? (
            <p className="mt-6 border-t border-slate-100 py-10 text-center text-sm text-slate-500">
              {emptyText}
            </p>
          ) : (
            <ul className="mt-6 divide-y divide-slate-100 border-t border-slate-100">
              {rows.map((row) => (
                <Row
                  key={row.id}
                  row={row}
                  isOpen={openId === row.id}
                  onToggle={() => setOpenId((current) => (current === row.id ? null : row.id))}
                />
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-medium text-slate-900">At a glance</h3>
          <p className="mt-1 text-sm text-slate-400">{glanceText}</p>

          <div className="py-12 text-center">
            <p className="text-4xl font-semibold text-slate-900">{totalCount}</p>
            <p className="mt-2 text-xs text-slate-500">
              {totalCount === 1 ? "active record" : "active records"}
            </p>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-4xl font-medium text-slate-900">{title}</h2>
          <p className="mt-2 text-base text-slate-500">
            Patient Care · {patientName} clinical record
          </p>
        </div>

        {canAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-[#6f8fd6] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5f80c9]"
          >
            <Plus size={18} />
            Add entry
          </button>
        )}
      </div>

      {body}
    </div>
  );
};

export default CareSection;
