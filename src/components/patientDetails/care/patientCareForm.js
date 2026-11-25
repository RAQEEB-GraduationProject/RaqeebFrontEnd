// Patient Care forms (POST /Patients/{patientId}/journal and /appointments):
// values, validation, backend-error mapping and date text.

export const JOURNAL_TYPES = [
  { value: "Note", label: "Note" },
  { value: "Reminder", label: "Reminder" },
  { value: "Instruction", label: "Instruction" },
];

export const CONTENT_MAX_LENGTH = 2000;
export const TITLE_MAX_LENGTH = 200;
export const LOCATION_MAX_LENGTH = 300;

export const INITIAL_JOURNAL_VALUES = { type: "", content: "" };

export const INITIAL_APPOINTMENT_VALUES = {
  title: "",
  date: "",
  time: "",
  providerId: "",
  location: "",
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

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

export const validateJournalEntry = (values) => {
  const errors = {};

  if (!JOURNAL_TYPES.some(({ value }) => value === values.type)) {
    errors.type = "Entry type is required.";
  }

  const content = values.content.trim();
  if (!content) {
    errors.content = "Content is required.";
  } else if (content.length > CONTENT_MAX_LENGTH) {
    errors.content = `Content must be at most ${CONTENT_MAX_LENGTH} characters.`;
  }

  return errors;
};

export const validateAppointment = (values) => {
  const errors = {};

  const title = values.title.trim();
  if (!title) {
    errors.title = "Title is required.";
  } else if (title.length > TITLE_MAX_LENGTH) {
    errors.title = `Title must be at most ${TITLE_MAX_LENGTH} characters.`;
  }

  if (!values.date) errors.date = "Date is required.";
  else if (!isValidDate(values.date)) errors.date = "Enter a valid date.";

  if (!values.time) errors.time = "Time is required.";
  else if (!TIME_PATTERN.test(values.time)) errors.time = "Enter a valid time.";

  if (!values.providerId) errors.providerId = "Provider is required.";

  if (values.location.trim().length > LOCATION_MAX_LENGTH) {
    errors.location = `Location must be at most ${LOCATION_MAX_LENGTH} characters.`;
  }

  return errors;
};

/*
  400 VALIDATION_ERROR / INVALID_PROVIDER errors ([{ field, message }], field
  like "Content", "$.appointmentDate" or "ProviderId") -> messages per form
  field, plus the ones that match no field. `aliases` maps a backend field
  name (lower case) to the form field.
*/
export const toFieldErrors = (apiErrors = [], fields, aliases = {}) => {
  const fieldErrors = {};
  const otherMessages = [];

  apiErrors.forEach(({ field, message }) => {
    const raw = String(field ?? "")
      .replace(/^\$\.?/, "")
      .split(".")
      .pop()
      .toLowerCase();
    const key = fields.find((name) => name.toLowerCase() === (aliases[raw] ?? raw));

    if (key && !fieldErrors[key]) fieldErrors[key] = message;
    else otherMessages.push(message);
  });

  return { fieldErrors, otherMessages };
};

export const JOURNAL_FIELDS = ["type", "content"];
export const JOURNAL_ALIASES = { entrytype: "type" };
export const APPOINTMENT_FIELDS = ["title", "date", "time", "providerId", "location"];
export const APPOINTMENT_ALIASES = { appointmentdate: "date", appointmenttime: "time" };

const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const dayText = (date, now) =>
  date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    ...(date.getFullYear() !== now.getFullYear() && { year: "numeric" }),
  });

const timeText = (date) =>
  date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });

// Journal badge (reference): "Today · 08:30", "Yesterday", "18 May".
// `value` is the backend's UTC timestamp, shown in the viewer's time zone.
export const formatJournalDate = (value, now = new Date()) => {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return null;

  if (sameDay(date, now)) return `Today · ${timeText(date)}`;

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(date, yesterday)) return "Yesterday";

  return dayText(date, now);
};

// Full date and time of an expanded journal entry.
export const formatJournalFull = (value) => {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return null;

  return `${date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} · ${timeText(date)}`;
};

// Appointment subtitle (reference): "Today · 14:30", "23 May · 08:00". Date
// and time are clinic values without a time zone, so they are never shifted.
export const formatAppointmentWhen = ({ date, time }, now = new Date()) => {
  if (!isValidDate(date ?? "")) return [date, time].filter(Boolean).join(" · ") || null;

  const [year, month, day] = date.split("-").map(Number);
  const when = new Date(year, month - 1, day);
  const dayLabel = sameDay(when, now) ? "Today" : dayText(when, now);

  return [dayLabel, time].filter(Boolean).join(" · ");
};
