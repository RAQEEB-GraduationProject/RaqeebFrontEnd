import { ChevronDown, Search } from "lucide-react";
import { SORT_NEWEST, SORT_OLDEST } from "./diagnosticsHelpers";

const controlClass =
  "w-full rounded-xl border border-field bg-white py-3 text-sm text-ink-soft outline-none transition placeholder:text-muted focus:border-focus focus:ring-2 focus:ring-focus/25";

export const SelectField = ({ label, value, onChange, children }) => (
  <div className="relative sm:w-44">
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label={label}
      className={`${controlClass} appearance-none pl-4 pr-10 font-medium`}
    >
      {children}
    </select>
    <ChevronDown
      size={16}
      aria-hidden="true"
      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
    />
  </div>
);

const Panel = ({ title, text, children }) => (
  <div className="rounded-2xl border border-line-soft bg-white px-6 py-14 text-center shadow-sm">
    <p className="text-sm font-semibold text-ink">{title}</p>
    {text && <p className="mt-1 text-sm text-muted-strong">{text}</p>}
    {children}
  </div>
);

const secondaryButtonClass =
  "mt-4 rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold text-accent transition hover:bg-surface-soft";

/*
  Layout of one Diagnostics section: heading, the records card (search,
  filters, sort, rows) and the "At a glance" card, with its own loading, error
  and empty states. `list` comes from usePatientDiagnosticList; `records` are
  the ones matching the current search / filters, rendered with `renderRecord`.
*/
const DiagnosticsSection = ({
  title,
  patientName,
  loadingText,
  errorTitle,
  emptyText,
  searchLabel,
  list,
  records,
  renderRecord,
  search,
  onSearch,
  sort,
  onSort,
  filters,
  onClearFilters,
  summary,
}) => {
  const { items, isLoading, error, retry } = list;

  let body;
  if (error) {
    body = (
      <Panel title={errorTitle} text={error}>
        <button type="button" onClick={retry} className={secondaryButtonClass}>
          Try again
        </button>
      </Panel>
    );
  } else if (!items) {
    body = (
      <div
        aria-busy={isLoading}
        className="rounded-2xl border border-line-soft bg-white px-6 py-14 text-center text-sm text-muted-strong shadow-sm"
      >
        {loadingText}
      </div>
    );
  } else {
    body = (
      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="min-w-0 rounded-2xl border border-line-soft bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-medium text-ink">{title} records</h3>
          <p className="mt-1 text-sm text-muted">Most recent clinical information</p>

          {items.length === 0 ? (
            <p className="mt-6 border-t border-line-soft py-10 text-center text-sm text-muted-strong">
              {emptyText}
            </p>
          ) : (
            <>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search
                    size={18}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => onSearch(event.target.value)}
                    placeholder={`${searchLabel}…`}
                    aria-label={searchLabel}
                    className={`${controlClass} pl-11 pr-4`}
                  />
                </div>
                {filters}
                <SelectField label={`Sort ${title} by date`} value={sort} onChange={onSort}>
                  <option value={SORT_NEWEST}>Newest first</option>
                  <option value={SORT_OLDEST}>Oldest first</option>
                </SelectField>
              </div>

              {records.length === 0 ? (
                <div className="mt-5 border-t border-line-soft py-10 text-center">
                  <p className="text-sm text-muted-strong">No records match your search.</p>
                  <button type="button" onClick={onClearFilters} className={secondaryButtonClass}>
                    Clear search and filters
                  </button>
                </div>
              ) : (
                <ul className="mt-5 divide-y divide-line-soft border-t border-line-soft">
                  {records.map((record) => (
                    <li key={record.id} className="space-y-3 py-5">
                      {renderRecord(record)}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        <div className="rounded-2xl border border-line-soft bg-white p-6 shadow-sm">
          <h3 className="text-lg font-medium text-ink">At a glance</h3>
          <p className="mt-1 text-sm text-muted">Current {title.toLowerCase()} summary</p>

          <div className="py-10 text-center">
            <p className="text-4xl font-semibold text-ink">{items.length}</p>
            <p className="mt-2 text-xs text-muted-strong">
              {items.length === 1 ? "active record" : "active records"}
            </p>
          </div>
          {summary}
        </div>
      </div>
    );
  }

  return (
    <section aria-label={title} className="space-y-6">
      <div>
        <h2 className="text-4xl font-medium text-ink">{title}</h2>
        <p className="mt-2 text-base text-muted-strong">
          Diagnostics · {patientName} clinical record
        </p>
      </div>

      {body}
    </section>
  );
};

export default DiagnosticsSection;
