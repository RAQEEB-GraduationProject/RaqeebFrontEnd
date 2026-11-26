import { LoaderCircle, Plus } from "lucide-react";

// Cancel / submit row of the Patient Care forms.
const CareFormActions = ({ isAdding, onCancel }) => (
  <div className="flex justify-end gap-3">
    <button
      type="button"
      onClick={onCancel}
      disabled={isAdding}
      className="rounded-xl border border-line bg-white px-6 py-3.5 text-xs font-bold text-ink transition hover:bg-surface-soft disabled:cursor-not-allowed disabled:border-disabled disabled:text-disabled-text disabled:hover:bg-white"
    >
      Cancel
    </button>

    <button
      type="submit"
      disabled={isAdding}
      className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-xs font-bold text-on-primary shadow-sm transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-disabled disabled:text-on-disabled disabled:shadow-none"
    >
      {isAdding ? <LoaderCircle size={14} className="animate-spin" /> : <Plus size={14} />}
      {isAdding ? "Adding..." : "Add record"}
    </button>
  </div>
);

export default CareFormActions;
