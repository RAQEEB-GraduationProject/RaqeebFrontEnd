import { useState } from "react";
import { ChevronDown } from "lucide-react";

import FormField from "../../forms/FormField";
import inputClass from "../../forms/inputClass";
import { usePatientCareStore } from "../../../store/patientCareStore";
import getErrorMessage from "../../../utils/getErrorMessage";
import CareFormActions from "./CareFormActions";
import {
  CONTENT_MAX_LENGTH,
  INITIAL_JOURNAL_VALUES,
  JOURNAL_ALIASES,
  JOURNAL_FIELDS,
  JOURNAL_TYPES,
  toFieldErrors,
  validateJournalEntry,
} from "./patientCareForm";

// POST /Patients/{patientId}/journal. Backend errors: 400 -> per-field
// messages; 403 / 404 / 409 -> the message.
const JournalEntryForm = ({ patientId, onAdded, onCancel }) => {
  const addJournalEntry = usePatientCareStore((state) => state.addJournalEntry);
  const isAdding = usePatientCareStore((state) => state.isAdding);

  const [values, setValues] = useState(INITIAL_JOURNAL_VALUES);
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
    const nextErrors = validateJournalEntry(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const { entry, error } = await addJournalEntry(patientId, values);

    if (error) {
      const { fieldErrors, otherMessages } = toFieldErrors(
        error.errors,
        JOURNAL_FIELDS,
        JOURNAL_ALIASES,
      );
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

    onAdded?.(entry);
  };

  const bind = (name) => ({
    id: `journal-${name}`,
    name,
    value: values[name],
    onChange: handleChange,
    disabled: isAdding,
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `journal-${name}-error` : undefined,
  });

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {formError && (
        <p role="alert" className="rounded-xl bg-danger-bg px-4 py-3 text-sm text-danger-text">
          {formError}
        </p>
      )}

      <FormField id="journal-type" label="Entry type" error={errors.type}>
        <div className="relative">
          <select {...bind("type")} className={`${inputClass(errors.type)} appearance-none pr-10`}>
            <option value="">Select entry type</option>
            {JOURNAL_TYPES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink"
          />
        </div>
      </FormField>

      <FormField id="journal-content" label="Content" error={errors.content}>
        <textarea
          {...bind("content")}
          rows={6}
          maxLength={CONTENT_MAX_LENGTH}
          placeholder="e.g. Drink plenty of water"
          className={`${inputClass(errors.content)} resize-y`}
        />
        <p className="mt-1 text-right text-[11px] text-muted">
          {values.content.length}/{CONTENT_MAX_LENGTH}
        </p>
      </FormField>

      <CareFormActions isAdding={isAdding} onCancel={onCancel} />
    </form>
  );
};

export default JournalEntryForm;
