const LINES = [
  { role: "doctor", label: "Doctor" },
  { role: "nurse", label: "Nurse" },
  { role: "caregiver", label: "Caregiver" },
];

const AssignedToCell = ({ assigned, staffById }) => {
  const lines = LINES.map(({ role, label }) => ({
    label,
    names: assigned[role].map((id) => staffById[id]?.name).filter(Boolean),
  })).filter((line) => line.names.length > 0);

  if (lines.length === 0) {
    return (
      <span className="inline-flex w-fit rounded-full border border-dashed border-slate-300 px-3 py-1 text-xs text-slate-400">
        Unassigned
      </span>
    );
  }

  return (
    <div className="space-y-0.5 text-sm text-slate-600">
      {lines.map((line) => (
        <p key={line.label} className="truncate">
          <span className="font-semibold text-[#0b2a3d]">{line.label}:</span>{" "}
          {line.names.join(" / ")}
        </p>
      ))}
    </div>
  );
};

export default AssignedToCell;
