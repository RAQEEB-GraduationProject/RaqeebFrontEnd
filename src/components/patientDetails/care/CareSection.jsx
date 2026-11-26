import { useState } from "react";
import { ChevronRight, Plus } from "lucide-react";

const Panel = ({ title, text, children }) => (
  <div className="rounded-2xl border border-line-soft bg-white px-6 py-14 text-center shadow-sm">
    <p className="text-sm font-semibold text-ink">{title}</p>
    {text && <p className="mt-1 text-sm text-muted-strong">{text}</p>}
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
        className="flex w-full items-center justify-between gap-4 px-0.5 py-5 text-left transition hover:bg-surface-soft/60"
      >
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-ink">{row.title}</span>
          {row.subtitle && (
            <span className="mt-1 block truncate text-xs text-muted">{row.subtitle}</span>
          )}
        </span>

        <span className="flex shrink-0 items-center gap-4">
          {row.badge && (
            <span className="max-w-[180px] truncate rounded-full bg-tag-bg px-3 py-1.5 text-xs font-semibold text-tag-text">
              {row.badge}
            </span>
          )}
          <ChevronRight
            size={18}
            aria-hidden="true"
            className={`text-muted-strong transition ${isOpen ? "rotate-90" : ""}`}
          />
        </span>
      </button>

      {isOpen && (
        <div id={panelId} className="mb-5 rounded-xl bg-surface-soft px-4 py-4">
          {row.details}
        </div>
      )}
    </li>
  );
};

/*
  Layout of a Patient Care records section (reference screenshot 095741):
  heading + "Add entry", the records card with expandable rows, and the
  "At a glance" card with the backend's totalCount.
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
          className="mt-4 rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold text-accent transition hover:bg-surface-soft"
        >
          Try again
        </button>
      </Panel>
    );
  } else if (!items && isLoading) {
    body = (
      <div
        aria-busy="true"
        className="rounded-2xl border border-line-soft bg-white px-6 py-14 text-center text-sm text-muted-strong shadow-sm"
      >
        {loadingText}
      </div>
    );
  } else if (!items) {
    body = <Panel title={emptyText} />;
  } else {
    body = (
      <div className="grid items-start gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-line-soft bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-medium text-ink">{title} records</h3>
          <p className="mt-1 text-sm text-muted">Most recent clinical information</p>

          {rows.length === 0 ? (
            <p className="mt-6 border-t border-line-soft py-10 text-center text-sm text-muted-strong">
              {emptyText}
            </p>
          ) : (
            <ul className="mt-6 divide-y divide-line-soft border-t border-line-soft">
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

        <section className="rounded-2xl border border-line-soft bg-white p-6 shadow-sm">
          <h3 className="text-lg font-medium text-ink">At a glance</h3>
          <p className="mt-1 text-sm text-muted">{glanceText}</p>

          <div className="py-12 text-center">
            <p className="text-4xl font-semibold text-ink">{totalCount}</p>
            <p className="mt-2 text-xs text-muted-strong">
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
          <h2 className="text-4xl font-medium text-ink">{title}</h2>
          <p className="mt-2 text-base text-muted-strong">
            Patient Care · {patientName} clinical record
          </p>
        </div>

        {canAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-on-primary shadow-sm transition hover:bg-primary-hover"
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
