import getErrorMessage from "./getErrorMessage";

/*
  Backend validation errors ([{ field, message }], field like "Title",
  "$.appointmentDate" or "ProviderId") -> messages per form field, plus the
  ones that match no field. `aliases` maps a backend field name (lower case) to
  the form field.
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

/*
  A failed save -> what a form shows:
    fieldErrors  messages under their fields
    formError    the general message, or null when the fields already say it all
  `codeFields` places an error that only has an errorCode under a field, e.g.
  { MRN_ALREADY_EXISTS: "medicalRecordNumber" }.
*/
export const toFormErrors = (error, fields, { aliases, codeFields = {} } = {}) => {
  const { fieldErrors, otherMessages } = toFieldErrors(error?.errors, fields, aliases);

  const codeField = codeFields[error?.errorCode];
  if (codeField && !fieldErrors[codeField]) fieldErrors[codeField] = error.message;

  let formError = null;
  if (otherMessages.length > 0) formError = [...new Set(otherMessages)].join(" ");
  else if (Object.keys(fieldErrors).length === 0) formError = getErrorMessage(error);

  return { fieldErrors, formError };
};
