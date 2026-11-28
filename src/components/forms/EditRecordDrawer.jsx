import { useEffect } from "react";
import { LoaderCircle, X } from "lucide-react";

import useEditForm from "./useEditForm";

/*
  Side drawer that edits one saved record (same shell as the app's other
  drawers). The form state is useEditForm's: see there for `id`, `load`,
  `toValues`, `validate`, `save`, `errorOptions` and `onSaved`.
  `children(form)` renders the fields. It can't be closed while saving.
*/
const EditRecordDrawer = ({ eyebrow, title, description, onClose, children, ...config }) => {
  const form = useEditForm(config);
  const { isSaving } = form;

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !isSaving && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isSaving, onClose]);

  const close = () => {
    if (!isSaving) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-overlay/40" onClick={close} aria-hidden="true" />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative flex h-full w-full max-w-[520px] flex-col bg-white shadow-xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-line-soft px-7 py-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-accent">
              {eyebrow}
            </p>
            <h2 className="mt-2 text-3xl font-medium text-ink">{title}</h2>
            <p className="mt-2 text-sm text-muted-strong">{description}</p>
          </div>

          <button
            type="button"
            onClick={close}
            disabled={isSaving}
            aria-label="Close"
            className="rounded-xl border border-line p-2.5 text-ink-soft transition hover:bg-surface-soft disabled:cursor-not-allowed disabled:text-disabled-text"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-7 py-6">
          {form.loadError ? (
            <div role="alert" className="py-8 text-center">
              <p className="text-sm font-semibold text-ink">Couldn&apos;t load the details</p>
              <p className="mt-1 text-sm text-muted-strong">{form.loadError}</p>
              <button
                type="button"
                onClick={form.retry}
                className="mt-4 rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold text-accent transition hover:bg-surface-soft"
              >
                Try again
              </button>
            </div>
          ) : !form.values ? (
            <p role="status" className="py-8 text-center text-sm text-muted-strong">
              Loading latest details…
            </p>
          ) : (
            <form onSubmit={form.handleSubmit} noValidate className="space-y-5">
              {form.formError && (
                <p role="alert" className="rounded-xl bg-danger-bg px-4 py-3 text-sm text-danger-text">
                  {form.formError}
                </p>
              )}

              {children(form)}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={close}
                  disabled={isSaving}
                  className="rounded-xl border border-line bg-white px-6 py-3.5 text-xs font-bold text-ink transition hover:bg-surface-soft disabled:cursor-not-allowed disabled:border-disabled disabled:text-disabled-text disabled:hover:bg-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving || !form.isDirty}
                  title={form.isDirty ? undefined : "No changes to save"}
                  className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-xs font-bold text-on-primary shadow-sm transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-disabled disabled:text-on-disabled disabled:shadow-none"
                >
                  {isSaving && <LoaderCircle size={14} className="animate-spin" />}
                  {isSaving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          )}
        </div>
      </aside>
    </div>
  );
};

export default EditRecordDrawer;
