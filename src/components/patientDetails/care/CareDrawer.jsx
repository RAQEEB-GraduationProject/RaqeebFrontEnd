import { useEffect } from "react";
import { X } from "lucide-react";

// "Add entry" side drawer of the Patient Care sections (same shell as the
// Medical History drawer). `eyebrow` names the section; `children` is the form.
const CareDrawer = ({ eyebrow, label, patientName, onClose, children }) => {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-overlay/40" onClick={onClose} aria-hidden="true" />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="relative flex h-full w-full max-w-[520px] flex-col bg-white shadow-xl"
      >
        <header className="flex items-start justify-between border-b border-line-soft px-7 py-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-accent">
              {eyebrow}
            </p>
            <h2 className="mt-2 text-3xl font-medium text-ink">Add entry</h2>
            <p className="mt-2 text-sm text-muted-strong">
              New record for <strong className="font-semibold">{patientName}</strong>.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-xl border border-line p-2.5 text-ink-soft transition hover:bg-surface-soft"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-7 py-6">{children}</div>
      </aside>
    </div>
  );
};

export default CareDrawer;
