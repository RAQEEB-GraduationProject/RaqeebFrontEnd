import { LoaderCircle, Plus } from "lucide-react";

// Cancel / submit row of the Patient Care forms.
const CareFormActions = ({ isAdding, onCancel }) => (
  <div className="flex justify-end gap-3">
    <button
      type="button"
      onClick={onCancel}
      disabled={isAdding}
      className="rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-xs font-bold text-[#0b2a3d] transition hover:bg-slate-50 disabled:opacity-60"
    >
      Cancel
    </button>

    <button
      type="submit"
      disabled={isAdding}
      className="flex items-center gap-2 rounded-xl bg-[#0f3d4c] px-6 py-3.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#0b3240] disabled:opacity-70"
    >
      {isAdding ? <LoaderCircle size={14} className="animate-spin" /> : <Plus size={14} />}
      {isAdding ? "Adding..." : "Add record"}
    </button>
  </div>
);

export default CareFormActions;
