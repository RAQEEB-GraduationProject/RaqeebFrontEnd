import { useMemo, useState } from "react";
import { ChevronDown, Download } from "lucide-react";

import { ALERT_COLORS, ALERT_STATUSES } from "../../data/mockAlerts";
import AlertDetails from "./AlertDetails";
import { ColorBadge, DevNotice, StatusBadge } from "./badges";
import {
  alertsToCsv,
  formatGenerated,
  formatResponse,
  toDateKey,
} from "./alertHelpers";

const COLUMN_DEFS = {
  alert: {
    label: "Alert",
    width: "minmax(110px,1fr)",
    render: (row) => (
      <div>
        <p className="text-sm font-semibold text-[#0b2a3d]">{row.id}</p>

        <p className="mt-1 text-xs text-slate-400">
          {formatGenerated(row.createdAt)}
        </p>
      </div>
    ),
  },
  patient: {
    label: "Patient",
    width: "minmax(150px,1.4fr)",
    render: (row) => (
      <span className="truncate text-sm text-slate-600">{row.patientName}</span>
    ),
  },
  event: {
    label: "Event",
    width: "minmax(180px,1.8fr)",
    render: (row) => (
      <span className="break-words text-sm text-slate-600">{row.event}</span>
    ),
  },
  color: {
    label: "Color",
    width: "minmax(90px,0.8fr)",
    render: (row) => <ColorBadge color={row.color} />,
  },
  status: {
    label: "Status",
    width: "minmax(130px,1fr)",
    render: (row) => <StatusBadge status={row.status} />,
  },
  doctor: {
    label: "Doctor",
    width: "minmax(150px,1.3fr)",
    render: (row) => (
      <span className="truncate text-sm text-slate-600">{row.doctorName}</span>
    ),
  },
  response: {
    label: "Response",
    width: "minmax(80px,0.8fr)",
    render: (row) => (
      <span className="text-sm text-slate-600">
        {formatResponse(row.responseMinutes)}
      </span>
    ),
  },
};

const DEFAULT_COLUMNS = Object.keys(COLUMN_DEFS);
const DEFAULT_FILTERS = ["date", "color", "status", "doctor"];

const toOptions = (values) => values.map((v) => ({ value: v, label: v }));

const FilterSelect = ({ label, value, onChange, allLabel, options }) => (
  <div className="relative w-full sm:w-[170px]">
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-4 pr-10 text-sm text-slate-600 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
    >
      <option value="all">{allLabel}</option>

      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>

    <ChevronDown
      size={16}
      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
    />
  </div>
);

const Message = ({ title, text, actionLabel, onAction }) => (
  <div className="border-t border-slate-100 px-6 py-14 text-center">
    <p className="text-sm font-semibold text-[#0b2a3d]">{title}</p>

    {text && <p className="mt-1 text-sm text-slate-500">{text}</p>}

    {actionLabel && (
      <button
        type="button"
        onClick={onAction}
        className="mt-5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-[#0f3d4c] transition hover:bg-slate-50"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

/*
  Shared alerts UI (list + details). It owns only view state: filters and the
  selected alert. The role page owns the data and what each role may do:

    alerts         enriched alerts (see enrichAlert) already scoped to the role
    columns        which table columns to show, in order
    filters        which filter controls to show ("date" | "color" | "status" | "doctor")
    canExport      show the CSV export button
    onResolve      pass to allow resolving; omit and the button is not rendered
    onAddNote      pass to allow internal notes; omit and the note box is hidden
    subtitle       page description
    isLoading/error  optional data-source states
*/
const AlertsView = ({
  alerts,
  columns = DEFAULT_COLUMNS,
  filters = DEFAULT_FILTERS,
  canExport = false,
  subtitle = "Monitor, investigate, and audit every hospital alert.",
  isLoading = false,
  error = null,
  devNotice,
  onResolve,
  onReview,
  onAddNote,
}) => {
  const [selectedId, setSelectedId] = useState(null);

  const [date, setDate] = useState("");
  const [color, setColor] = useState("all");
  const [status, setStatus] = useState("all");
  const [doctor, setDoctor] = useState("all");

  const doctorOptions = useMemo(() => {
    const byId = new Map(
      alerts.filter((a) => a.doctorId).map((a) => [a.doctorId, a.doctorName]),
    );

    return [...byId].map(([value, label]) => ({ value, label }));
  }, [alerts]);

  const filteredRows = useMemo(
    () =>
      alerts.filter(
        (row) =>
          (!date || toDateKey(row.createdAt) === date) &&
          (color === "all" || row.color === color) &&
          (status === "all" || row.status === status) &&
          (doctor === "all" || row.doctorId === doctor),
      ),
    [alerts, date, color, status, doctor],
  );

  const hasFilters =
    date !== "" || color !== "all" || status !== "all" || doctor !== "all";

  const clearFilters = () => {
    setDate("");
    setColor("all");
    setStatus("all");
    setDoctor("all");
  };

  const selected = alerts.find((row) => row.id === selectedId);

  const handleExport = () => {
    const blob = new Blob([alertsToCsv(filteredRows)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "alerts.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  if (selected) {
    return (
      <AlertDetails
        key={selected.id}
        alert={selected}
        onBack={() => setSelectedId(null)}
        devNotice={devNotice}
        onResolve={onResolve}
        onReview={onReview}
        onAddNote={onAddNote}
      />
    );
  }

  const shownColumns = columns.map((key) => COLUMN_DEFS[key]);
  const gridStyle = {
    gridTemplateColumns: shownColumns.map((c) => c.width).join(" "),
  };
  const gridClass = "grid items-center gap-4 px-6";

  return (
    <div className="space-y-8">
      {/* Heading */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-medium text-[#0b2a3d]">Alerts</h1>

          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
        </div>

        {canExport && (
          <button
            type="button"
            onClick={handleExport}
            disabled={filteredRows.length === 0}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-4 text-sm font-bold text-[#0b2a3d] shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={18} />
            Export
          </button>
        )}
      </header>

      {devNotice && <DevNotice text={devNotice} />}

      {/* Filters */}
      {filters.length > 0 && (
        <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:flex-wrap">
          {filters.includes("date") && (
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              aria-label="Filter by date"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 sm:w-[170px]"
            />
          )}

          {filters.includes("color") && (
            <FilterSelect
              label="Filter by color"
              value={color}
              onChange={setColor}
              allLabel="All colors"
              options={toOptions(ALERT_COLORS)}
            />
          )}

          {filters.includes("status") && (
            <FilterSelect
              label="Filter by status"
              value={status}
              onChange={setStatus}
              allLabel="All statuses"
              options={toOptions(ALERT_STATUSES)}
            />
          )}

          {filters.includes("doctor") && (
            <FilterSelect
              label="Filter by doctor"
              value={doctor}
              onChange={setDoctor}
              allLabel="All doctors"
              options={doctorOptions}
            />
          )}
        </section>
      )}

      {error && alerts.length > 0 && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {error}
        </p>
      )}

      {/* Alerts table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            <div
              style={gridStyle}
              className={`${gridClass} py-4 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500`}
            >
              {shownColumns.map((c) => (
                <span key={c.label}>{c.label}</span>
              ))}
            </div>

            {isLoading && alerts.length === 0 ? (
              <Message title="Loading alerts…" />
            ) : error && alerts.length === 0 ? (
              <Message title="Couldn't load alerts" text={error} />
            ) : filteredRows.length === 0 ? (
              <Message
                title={
                  hasFilters ? "No alerts match your filters" : "No alerts yet"
                }
                text={
                  hasFilters
                    ? "Try different filters or clear them."
                    : "Alerts raised by the monitoring engine will appear here."
                }
                actionLabel={hasFilters ? "Clear filters" : undefined}
                onAction={clearFilters}
              />
            ) : (
              filteredRows.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => setSelectedId(row.id)}
                  aria-label={`View details for ${row.id}`}
                  style={gridStyle}
                  className={`${gridClass} w-full border-t border-slate-100 py-5 text-left transition hover:bg-slate-50/70 focus-visible:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-600`}
                >
                  {shownColumns.map((c) => (
                    <div key={c.label} className="min-w-0">
                      {c.render(row)}
                    </div>
                  ))}
                </button>
              ))
            )}
          </div>
        </div>
      </section>

      {alerts.length > 0 && (
        <p className="text-xs text-slate-500">
          Showing {filteredRows.length} of {alerts.length} alerts
        </p>
      )}
    </div>
  );
};

export default AlertsView;
