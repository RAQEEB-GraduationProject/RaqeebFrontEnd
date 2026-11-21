// Medical history record form (POST /Patients/{patientId}/medical-history):
// categories, values, validation and backend-error mapping. Used by the
// patient details page and by the optional step after a profile is created.

// `type` is the value the backend expects; `key` is the GET response list.
export const MEDICAL_HISTORY_CATEGORIES = [
  { type: "Disease", key: "diseases", label: "Diseases", singular: "Disease" },
  { type: "Allergy", key: "allergies", label: "Allergies", singular: "Allergy" },
  { type: "Surgery", key: "surgeries", label: "Surgeries", singular: "Surgery" },
  {
    type: "FamilyHistory",
    key: "familyHistory",
    label: "Family history",
    singular: "Family history",
  },
];

export const NAME_MAX_LENGTH = 200;
export const NOTES_MAX_LENGTH = 1000;

export const INITIAL_ENTRY_VALUES = {
  type: "",
  name: "",
  date: "",
  notes: "",
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// "yyyy-MM-dd" that is a real calendar date.
const isValidDate = (value) => {
  if (!DATE_PATTERN.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

export const validateEntry = (values) => {
  const errors = {};

  if (!MEDICAL_HISTORY_CATEGORIES.some((category) => category.type === values.type)) {
    errors.type = "Record type is required.";
  }

  const name = values.name.trim();
  if (!name) {
    errors.name = "Name is required.";
  } else if (name.length > NAME_MAX_LENGTH) {
    errors.name = `Name must be at most ${NAME_MAX_LENGTH} characters.`;
  }

  if (values.date && !isValidDate(values.date)) {
    errors.date = "Enter a valid date.";
  }

  if (values.notes.trim().length > NOTES_MAX_LENGTH) {
    errors.notes = `Notes must be at most ${NOTES_MAX_LENGTH} characters.`;
  }

  return errors;
};

const FIELDS = ["type", "name", "date", "notes"];

/*
  400 VALIDATION_ERROR errors ([{ field, message }], field like "Name" or
  "$.date") -> messages per form field, plus the ones that match no field.
*/
export const toEntryFieldErrors = (apiErrors = []) => {
  const fieldErrors = {};
  const otherMessages = [];

  apiErrors.forEach(({ field, message }) => {
    const key = String(field ?? "")
      .replace(/^\$\.?/, "")
      .split(".")
      .pop()
      .toLowerCase();

    if (FIELDS.includes(key) && !fieldErrors[key]) {
      fieldErrors[key] = message;
    } else {
      otherMessages.push(message);
    }
  });

  return { fieldErrors, otherMessages };
};

// "2025-02-01" -> "Feb 2025" (short) or "1 Feb 2025". Parsed as a calendar
// date, so no time zone can shift it. Unparseable text is shown as-is.
export const formatHistoryDate = (value, { short = false } = {}) => {
  if (!value) return null;
  if (!isValidDate(value)) return value;

  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-GB", {
    timeZone: "UTC",
    ...(short ? {} : { day: "numeric" }),
    month: "short",
    year: "numeric",
  });
};
