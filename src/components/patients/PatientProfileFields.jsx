import { ChevronDown } from "lucide-react";

import FormField from "../forms/FormField";
import inputClass from "../forms/inputClass";
import {
  BLOOD_GROUP_OPTIONS,
  GENDER_OPTIONS,
  PROFILE_MAX_LENGTHS,
  RISK_LEVEL_OPTIONS,
  todayString,
} from "./patientProfileForm";

const RECORD_NUMBER_FIELD = { name: "medicalRecordNumber", label: "Medical record number" };

const TEXT_FIELDS = [
  { name: "diagnosis", label: "Diagnosis" },
  { name: "stage", label: "Stage" },
  { name: "treatment", label: "Treatment" },
  { name: "protocol", label: "Protocol" },
];

// A saved value outside the list (the backend stores free text, e.g. risk
// "Low") is offered too, so editing never drops or replaces it.
const SelectField = ({ name, label, placeholder, options, bind, error }) => {
  const props = bind(name);
  const choices =
    props.value && !options.includes(props.value) ? [props.value, ...options] : options;

  return (
    <FormField id={name} label={label} error={error}>
      <div className="relative">
        <select {...props} className={`${inputClass(error)} appearance-none pr-10`}>
          <option value="">{placeholder}</option>
          {choices.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink"
        />
      </div>
    </FormField>
  );
};

/*
  The patient medical profile inputs. State lives in the parent:
    values / errors   objects keyed by field name
    onChange          input change handler
    disabled          true while saving
    fixedGender       optional; when set the gender is shown read-only with
                      this value (the parent keeps values.gender equal to it)
    withRecordNumber  adds the medical record number (editing only)
*/
const PatientProfileFields = ({
  values,
  errors,
  onChange,
  disabled,
  fixedGender,
  withRecordNumber = false,
}) => {
  const bind = (name) => ({
    id: name,
    name,
    value: values[name],
    onChange,
    disabled,
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });

  return (
    <div className="grid gap-x-5 gap-y-5 md:grid-cols-2">
      <FormField id="dateOfBirth" label="Date of birth" error={errors.dateOfBirth}>
        <input
          {...bind("dateOfBirth")}
          type="date"
          max={todayString()}
          className={inputClass(errors.dateOfBirth)}
        />
      </FormField>

      {fixedGender ? (
        <FormField id="gender" label="Gender" error={errors.gender}>
          <input
            id="gender"
            name="gender"
            type="text"
            value={fixedGender}
            readOnly
            aria-readonly="true"
            className={`${inputClass(errors.gender)} cursor-not-allowed bg-surface-soft text-ink-soft`}
          />
        </FormField>
      ) : (
        <SelectField
          name="gender"
          label="Gender"
          placeholder="Select gender"
          options={GENDER_OPTIONS}
          bind={bind}
          error={errors.gender}
        />
      )}

      <SelectField
        name="bloodGroup"
        label="Blood group (optional)"
        placeholder="Select blood group"
        options={BLOOD_GROUP_OPTIONS}
        bind={bind}
        error={errors.bloodGroup}
      />

      {(withRecordNumber ? [RECORD_NUMBER_FIELD, ...TEXT_FIELDS] : TEXT_FIELDS).map(
        ({ name, label }) => (
          <FormField key={name} id={name} label={label} error={errors[name]}>
            <input
              {...bind(name)}
              type="text"
              autoComplete="off"
              maxLength={PROFILE_MAX_LENGTHS[name]}
              placeholder={`Enter ${label.toLowerCase()}`}
              className={inputClass(errors[name])}
            />
          </FormField>
        ),
      )}

      <SelectField
        name="riskLevel"
        label="Risk level"
        placeholder="Select risk level"
        options={RISK_LEVEL_OPTIONS}
        bind={bind}
        error={errors.riskLevel}
      />
    </div>
  );
};

export default PatientProfileFields;
