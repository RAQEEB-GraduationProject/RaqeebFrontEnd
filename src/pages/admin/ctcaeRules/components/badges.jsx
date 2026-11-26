const HOME_STYLES = {
  Yes: "bg-success-bg text-success-text",
  Partial: "bg-warning-bg text-warning-text",
  No: "bg-danger-bg text-danger-text",
};

export const CategoryBadge = ({ value }) => (
  <span className="inline-flex w-fit max-w-full rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-strong">
    <span className="truncate">{value}</span>
  </span>
);

export const HomeBadge = ({ value }) => (
  <span
    className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
      HOME_STYLES[value] ?? "bg-surface-muted text-ink-soft"
    }`}
  >
    {value}
  </span>
);

export const PediatricBadge = ({ value }) => (
  <span
    className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
      value === "Pediatric-specific"
        ? "bg-info-bg text-info-text"
        : "bg-surface-muted text-ink-soft"
    }`}
  >
    {value}
  </span>
);
