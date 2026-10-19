const COLOR_STYLES = {
  Red: "bg-rose-100 text-rose-700",
  Orange: "bg-orange-100 text-orange-700",
  Yellow: "bg-amber-100 text-amber-700",
  Green: "bg-emerald-100 text-emerald-700",
};

const STATUS_DOTS = {
  Open: "bg-rose-500",
  Escalated: "bg-rose-500",
  Acknowledged: "bg-sky-600",
  Resolved: "bg-emerald-500",
};

// Shown while a page runs on mock data / local-only actions.
export const DevNotice = ({ text }) => (
  <p
    role="note"
    className="rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800"
  >
    {text}
  </p>
);

export const ColorBadge =({ color }) => (
  <span
    className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
      COLOR_STYLES[color] ?? "bg-slate-100 text-slate-700"
    }`}
  >
    {color}
  </span>
);

export const StatusBadge = ({ status }) => (
  <span className="inline-flex items-center gap-2 text-xs text-slate-600">
    <span
      className={`h-2 w-2 rounded-full ${STATUS_DOTS[status] ?? "bg-slate-400"}`}
    />

    {status}
  </span>
);
