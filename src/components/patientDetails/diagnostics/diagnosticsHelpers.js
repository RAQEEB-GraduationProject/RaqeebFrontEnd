// Date text, sorting, searching and flag styles shared by the Diagnostics lists.

const HAS_TIME_ZONE = /(Z|[+-]\d{2}:?\d{2})$/i;

/*
  "2026-11-18T08:30:00" -> "18 Nov 2026, 08:30 UTC". The API sends UTC values
  without a zone suffix, so they are read and shown as UTC (as printed in the
  PDF reports), never shifted. Unreadable text is shown as it is.
*/
export const formatDiagnosticDate = (value) => {
  if (!value) return null;

  const date = new Date(HAS_TIME_ZONE.test(value) ? value : `${value}Z`);
  if (Number.isNaN(date.getTime())) return value;

  const day = date.toLocaleDateString("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const time = date.toLocaleTimeString("en-GB", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${day}, ${time} UTC`;
};

export const SORT_NEWEST = "newest";
export const SORT_OLDEST = "oldest";

/*
  Records whose `nameKey` contains the search text, ordered by `dateKey`. The
  API already returns newest first; records with the same date keep its order.
*/
export const searchAndSort = (items, { search, nameKey, dateKey, sort }) => {
  const term = search.trim().toLowerCase();
  const matches = term
    ? items.filter((item) => item[nameKey].toLowerCase().includes(term))
    : items;

  const direction = sort === SORT_OLDEST ? 1 : -1;
  return [...matches].sort(
    (a, b) => direction * (a[dateKey] ?? "").localeCompare(b[dateKey] ?? ""),
  );
};

// The flags the API documents; the colour only reflects the returned value.
export const LAB_FLAGS = ["Normal", "High", "Low"];

const FLAG_STYLES = {
  Normal: "bg-success-bg text-success-text",
  High: "bg-danger-bg text-danger-text",
  Low: "bg-risk-high-bg text-risk-high-text",
};

export const getFlagStyle = (flag) =>
  FLAG_STYLES[flag] ?? "bg-surface-muted text-ink-soft";
