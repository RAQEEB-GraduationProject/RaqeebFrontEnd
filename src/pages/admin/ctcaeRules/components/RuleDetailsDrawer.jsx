import { useEffect } from "react";
import { Pencil, X } from "lucide-react";

import { HomeBadge, PediatricBadge } from "./badges";

const GRADES = ["grade1", "grade2", "grade3", "grade4", "grade5"];

const Section = ({ title, children }) => (
  <section className="space-y-2 border-t border-slate-100 pt-5">
    <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
      {title}
    </h3>

    <div className="text-sm leading-relaxed text-[#0b2a3d]">{children}</div>
  </section>
);

const RuleDetailsDrawer = ({ rule, onEdit, onClose }) => {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-slate-900/40"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`${rule.adverseEvent} details`}
        className="relative flex h-full w-full max-w-[560px] flex-col bg-white shadow-xl"
      >
        <header className="flex items-start justify-between border-b border-slate-100 px-7 py-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-700">
              {rule.category}
            </p>

            <h2 className="mt-2 text-3xl font-medium text-[#0b2a3d]">
              {rule.adverseEvent}
            </h2>

            <div className="mt-3 flex flex-wrap gap-2">
              <HomeBadge value={rule.homeMonitoring} />
              <PediatricBadge value={rule.pediatricCriteria} />
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-7 py-6">
          {GRADES.map((grade, index) => (
            <Section key={grade} title={`Grade ${index + 1}`}>
              {rule[grade]}
            </Section>
          ))}

          <Section title="Notes">{rule.notes || "—"}</Section>

          <Section title="Pediatric notes">{rule.pediatricNotes || "—"}</Section>
        </div>

        <footer className="flex justify-end gap-3 border-t border-slate-100 px-7 py-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#0f3d4c] transition hover:bg-slate-50"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => onEdit(rule)}
            className="flex items-center gap-2 rounded-xl bg-[#0f3d4c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b2a3d]"
          >
            <Pencil size={14} />
            Edit rule
          </button>
        </footer>
      </aside>
    </div>
  );
};

export default RuleDetailsDrawer;
