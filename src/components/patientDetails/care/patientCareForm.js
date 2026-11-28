// Patient Care appointment form (POST /Patients/{patientId}/appointments):
// values, validation, backend field names and date text.

export const TITLE_MAX_LENGTH = 200;
export const LOCATION_MAX_LENGTH = 300;

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

// Form fields that backend errors are mapped to (see utils/formErrors).
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

// Appointment subtitle (reference): "Today · 14:30", "23 May · 08:00". Date
// and time are clinic values without a time zone, so they are never shifted.
export const formatAppointmentWhen = ({ date, time }, now = new Date()) => {
  if (!isValidDate(date ?? "")) return [date, time].filter(Boolean).join(" · ") || null;

  const [year, month, day] = date.split("-").map(Number);
  const when = new Date(year, month - 1, day);
  const dayLabel = sameDay(when, now) ? "Today" : dayText(when, now);

  return [dayLabel, time].filter(Boolean).join(" · ");
};
