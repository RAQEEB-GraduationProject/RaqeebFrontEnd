import { useState } from "react";
import { ChevronDown, LoaderCircle, Plus } from "lucide-react";

import FormField from "../../forms/FormField";
import inputClass from "../../forms/inputClass";
import { usePatientMedicalHistoryStore } from "../../../store/patientMedicalHistoryStore";
import getErrorMessage from "../../../utils/getErrorMessage";
import {
  INITIAL_ENTRY_VALUES,
  MEDICAL_HISTORY_CATEGORIES,
  NAME_MAX_LENGTH,
  NOTES_MAX_LENGTH,
  toEntryFieldErrors,
  validateEntry,
} from "./medicalHistoryForm";

/*
  The one "add medical history record" form, used by the patient details page
  (inside a drawer) and by the optional step after a patient profile is
  created. Sends POST /Patients/{patientId}/medical-history for `patientId`
  (the patient profile id, never a user id). After a success the form is
  cleared for the next record and `onAdded(entry)` is called.
  Backend errors: 400 -> per-field messages; 403 / 404 / 409 -> the message.
*/
const MedicalHistoryEntryForm = ({ patientId, onAdded, onCancel, cancelLabel = "Cancel" }) => {
  const addEntry = usePatientMedicalHistoryStore((state) => state.addEntry);
  const isAdding = usePatientMedicalHistoryStore((state) => state.isAdding);

  const [values, setValues] = useState(INITIAL_ENTRY_VALUES);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isAdding) return;

    setFormError(null);
    const nextErrors = validateEntry(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const { entry, error } = await addEntry(patientId, values);

    if (error) {
      const { fieldErrors, otherMessages } = toEntryFieldErrors(error.errors);
      setErrors(fieldErrors);
      setFormError(
        otherMessages.length > 0
          ? otherMessages.join(" ")
          : Object.keys(fieldErrors).length > 0
            ? null
            : getErrorMessage(error),
      );
      return;
    }

    setValues(INITIAL_ENTRY_VALUES);
    setErrors({});
    onAdded?.(entry);
  };

  const bind = (name) => ({
    id: `history-${name}`,
    name,
    value: values[name],
    onChange: handleChange,
    disabled: isAdding,
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `history-${name}-error` : undefined,
  });

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {formError && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {formError}
        </p>
      )}

      <div className="grid gap-x-5 gap-y-5 md:grid-cols-2">
        <FormField id="history-type" label="Record type" error={errors.type}>
          <div className="relative">
            <select
              {...bind("type")}
              className={`${inputClass(errors.type)} appearance-none pr-10`}
            >
              <option value="">Select record type</option>
              {MEDICAL_HISTORY_CATEGORIES.map(({ type, singular }) => (
                <option key={type} value={type}>
                  {singular}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#0b2a3d]"
            />
          </div>
        </FormField>

        <FormField id="history-date" label="Date (optional)" error={errors.date}>
          <input {...bind("date")} type="date" className={inputClass(errors.date)} />
        </FormField>
      </div>

      <FormField id="history-name" label="Name" error={errors.name}>
        <input
          {...bind("name")}
          type="text"
          autoComplete="off"
          maxLength={NAME_MAX_LENGTH}
          placeholder="e.g. Lumpectomy"
          className={inputClass(errors.name)}
        />
      </FormField>

      <FormField id="history-notes" label="Notes (optional)" error={errors.notes}>
        <textarea
          {...bind("notes")}
          rows={3}
          maxLength={NOTES_MAX_LENGTH}
          placeholder="e.g. Left breast, no complications"
          className={`${inputClass(errors.notes)} resize-y`}
        />
        <p className="mt-1 text-right text-[11px] text-slate-400">
          {values.notes.length}/{NOTES_MAX_LENGTH}
        </p>
      </FormField>

      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isAdding}
            className="rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-xs font-bold text-[#0b2a3d] transition hover:bg-slate-50 disabled:opacity-60"
          >
            {cancelLabel}
          </button>
        )}

        <button
          type="submit"
          disabled={isAdding}
          className="flex items-center gap-2 rounded-xl bg-[#0f3d4c] px-6 py-3.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#0b3240] disabled:opacity-70"
        >
          {isAdding ? (
            <LoaderCircle size={14} className="animate-spin" />
          ) : (
            <Plus size={14} />
          )}
          {isAdding ? "Adding..." : "Add record"}
        </button>
      </div>
    </form>
  );
};

export default MedicalHistoryEntryForm;
