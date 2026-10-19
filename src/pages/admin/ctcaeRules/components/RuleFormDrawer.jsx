import { useEffect, useState } from "react";
import { ChevronDown, X } from "lucide-react";

import {
  HOME_MONITORING_OPTIONS,
  PEDIATRIC_CRITERIA_OPTIONS,
} from "../../../../data/ctcaeRules";

const GRADES = ["grade1", "grade2", "grade3", "grade4", "grade5"];

const EMPTY_RULE = {
  category: "",
  adverseEvent: "",
  grade1: "N/A",
  grade2: "N/A",
  grade3: "N/A",
  grade4: "N/A",
  grade5: "N/A",
  homeMonitoring: "Yes",
  notes: "",
  pediatricCriteria: "Same as Adult",
  pediatricNotes: "",
};

const validate = (values, rules, editingId) => {
  const errors = {};
  const name = values.adverseEvent.trim();
  const category = values.category.trim();

  if (!name) {
    errors.adverseEvent = "Adverse event is required.";
  } else if (
    rules.some(
      (rule) =>
        rule.id !== editingId &&
        rule.adverseEvent.toLowerCase() === name.toLowerCase() &&
        rule.category.toLowerCase() === category.toLowerCase(),
    )
  ) {
    errors.adverseEvent = "This adverse event already exists in that category.";
  }

  if (!category) errors.category = "Category is required.";

  GRADES.forEach((grade) => {
    if (!values[grade].trim()) {
      errors[grade] = "Enter the criteria, or N/A if not defined.";
    }
  });

  return errors;
};

const inputClass = (hasError) =>
  `w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#0b2a3d] outline-none transition placeholder:text-slate-400 focus:ring-2 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
      : "border-slate-200 focus:border-teal-600 focus:ring-teal-600/20"
  }`;

const Field = ({ id, label, error, children }) => (
  <div>
    <label htmlFor={id} className="mb-2 block text-xs font-medium text-teal-800">
      {label}
    </label>

    {children}

    {error && (
      <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-red-600">
        {error}
      </p>
    )}
  </div>
);

const SelectField = ({ id, label, value, onChange, options }) => (
  <Field id={id} label={label}>
    <div className="relative">
      <select
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        className={`${inputClass(false)} appearance-none pr-10`}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#0b2a3d]"
      />
    </div>
  </Field>
);

/*
  rule set  → edit mode: every field is prefilled from that rule.
  rule null → add mode: empty form.
  Mount it only while open (use a `key`) so its state starts fresh.
  Fields the form does not know about are kept untouched on save.
*/
const RuleFormDrawer = ({ rule, rules, categories, onSave, onClose }) => {
  const isEdit = Boolean(rule);

  const [values, setValues] = useState(
    rule ? { ...EMPTY_RULE, ...rule } : EMPTY_RULE,
  );
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setValues((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nextErrors = validate(values, rules, rule?.id);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    onSave({
      ...values,
      category: values.category.trim(),
      adverseEvent: values.adverseEvent.trim(),
      grade1: values.grade1.trim(),
      grade2: values.grade2.trim(),
      grade3: values.grade3.trim(),
      grade4: values.grade4.trim(),
      grade5: values.grade5.trim(),
      notes: values.notes.trim(),
      pediatricNotes: values.pediatricNotes.trim(),
    });
  };

  const fieldProps = (name) => ({
    id: name,
    name,
    value: values[name],
    onChange: handleChange,
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-slate-900/40"
        onClick={onClose}
        aria-hidden="true"
      />

      <form
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? "Edit CTCAE rule" : "Add CTCAE rule"}
        onSubmit={handleSubmit}
        noValidate
        className="relative flex h-full w-full max-w-[560px] flex-col bg-white shadow-xl"
      >
        <header className="flex items-start justify-between border-b border-slate-100 px-7 py-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-teal-700">
              CTCAE rule
            </p>

            <h2 className="mt-2 text-3xl font-medium text-[#0b2a3d]">
              {isEdit ? "Edit rule" : "Add rule"}
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {isEdit
                ? "Update the grading thresholds and pediatric information."
                : "Define a new adverse event and its grading thresholds."}
            </p>
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
          <Field
            id="adverseEvent"
            label="Adverse event"
            error={errors.adverseEvent}
          >
            <input
              {...fieldProps("adverseEvent")}
              type="text"
              autoComplete="off"
              placeholder="e.g. Nausea"
              className={inputClass(errors.adverseEvent)}
            />
          </Field>

          <Field id="category" label="CTCAE category" error={errors.category}>
            <input
              {...fieldProps("category")}
              type="text"
              list="ctcae-categories"
              autoComplete="off"
              placeholder="Choose or type a category"
              className={inputClass(errors.category)}
            />

            <datalist id="ctcae-categories">
              {categories.map((category) => (
                <option key={category} value={category} />
              ))}
            </datalist>
          </Field>

          <div className="space-y-5 border-t border-slate-100 pt-5">
            {GRADES.map((grade, index) => (
              <Field
                key={grade}
                id={grade}
                label={`Grade ${index + 1}`}
                error={errors[grade]}
              >
                <textarea
                  {...fieldProps(grade)}
                  rows={2}
                  className={`${inputClass(errors[grade])} resize-y`}
                />
              </Field>
            ))}
          </div>

          <div className="grid gap-5 border-t border-slate-100 pt-5 sm:grid-cols-2">
            <SelectField
              id="homeMonitoring"
              label="Suitable for home monitoring"
              value={values.homeMonitoring}
              onChange={handleChange}
              options={HOME_MONITORING_OPTIONS}
            />

            <SelectField
              id="pediatricCriteria"
              label="Pediatric criteria"
              value={values.pediatricCriteria}
              onChange={handleChange}
              options={PEDIATRIC_CRITERIA_OPTIONS}
            />
          </div>

          <Field id="notes" label="Notes">
            <textarea
              {...fieldProps("notes")}
              rows={3}
              className={`${inputClass(false)} resize-y`}
            />
          </Field>

          <Field id="pediatricNotes" label="Pediatric notes">
            <textarea
              {...fieldProps("pediatricNotes")}
              rows={4}
              className={`${inputClass(false)} resize-y`}
            />
          </Field>
        </div>

        <footer className="flex justify-end gap-3 border-t border-slate-100 px-7 py-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#0f3d4c] transition hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="rounded-xl bg-[#0f3d4c] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b2a3d]"
          >
            {isEdit ? "Save changes" : "Add rule"}
          </button>
        </footer>
      </form>
    </div>
  );
};

export default RuleFormDrawer;
