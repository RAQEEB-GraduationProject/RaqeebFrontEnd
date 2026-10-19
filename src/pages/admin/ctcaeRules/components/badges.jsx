const HOME_STYLES = {
  Yes: "bg-emerald-50 text-emerald-800",
  Partial: "bg-amber-50 text-amber-800",
  No: "bg-rose-50 text-rose-800",
};

export const CategoryBadge = ({ value }) => (
  <span className="inline-flex w-fit max-w-full rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-900">
    <span className="truncate">{value}</span>
  </span>
);

export const HomeBadge = ({ value }) => (
  <span
    className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
      HOME_STYLES[value] ?? "bg-slate-100 text-slate-700"
    }`}
  >
    {value}
  </span>
);

export const PediatricBadge = ({ value }) => (
  <span
    className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
      value === "Pediatric-specific"
        ? "bg-sky-50 text-sky-900"
        : "bg-slate-100 text-slate-700"
    }`}
  >
    {value}
  </span>
);
