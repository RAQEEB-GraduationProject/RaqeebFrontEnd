const COLOR_STYLES = {
  Red: "bg-risk-critical-bg text-risk-critical-text",
  Orange: "bg-risk-high-bg text-risk-high-text",
  Yellow: "bg-risk-attention-bg text-risk-attention-text",
  Green: "bg-risk-stable-bg text-risk-stable-text",
};

const STATUS_DOTS = {
  Open: "bg-danger",
  Escalated: "bg-danger",
  Acknowledged: "bg-info",
  Resolved: "bg-success",
};

// Shown while a page runs on mock data / local-only actions.
export const DevNotice = ({ text }) => (
  <p
    role="note"
    className="rounded-xl bg-warning-bg px-4 py-3 text-xs text-warning-text"
  >
    {text}
  </p>
);

export const ColorBadge =({ color }) => (
  <span
    className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
      COLOR_STYLES[color] ?? "bg-surface-muted text-ink-soft"
    }`}
  >
    {color}
  </span>
);

export const StatusBadge = ({ status }) => (
  <span className="inline-flex items-center gap-2 text-xs text-ink-soft">
    <span
      className={`h-2 w-2 rounded-full ${STATUS_DOTS[status] ?? "bg-muted"}`}
    />

    {status}
  </span>
);
