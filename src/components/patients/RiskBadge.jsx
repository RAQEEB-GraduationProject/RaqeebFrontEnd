const STYLES = {
  Critical: "bg-risk-critical-bg text-risk-critical-text",
  High: "bg-risk-high-bg text-risk-high-text",
  Medium: "bg-risk-attention-bg text-risk-attention-text",
  Stable: "bg-risk-stable-bg text-risk-stable-text",
};

const RiskBadge = ({ risk, label }) => (
  <span
    className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
      STYLES[risk] ?? "bg-surface-muted text-ink-soft"
    }`}
  >
    {label ?? (risk || "—")}
  </span>
);

export default RiskBadge;
