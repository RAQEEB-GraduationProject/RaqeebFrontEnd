const STYLES = {
  Critical: "bg-rose-50 text-rose-700",
  High: "bg-orange-50 text-orange-700",
  Medium: "bg-amber-50 text-amber-700",
  Stable: "bg-emerald-50 text-emerald-700",
};

const RiskBadge = ({ risk }) => (
  <span
    className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
      STYLES[risk] ?? "bg-slate-100 text-slate-600"
    }`}
  >
    {risk || "—"}
  </span>
);

export default RiskBadge;
