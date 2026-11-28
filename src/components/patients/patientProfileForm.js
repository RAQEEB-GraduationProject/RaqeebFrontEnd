// Patient medical profile form: values, validation and payload.
//   POST /Patients       "Add hospital user" and "Complete patient account"
//   PUT /Patients/{id}   "Edit patient" on the patient details page

// The backend's maximum text lengths (CreatePatientDto / UpdatePatientDto).
export const PROFILE_MAX_LENGTHS = {
  medicalRecordNumber: 100,
  diagnosis: 200,
  stage: 100,
  treatment: 200,
  protocol: 200,
};

export const GENDER_OPTIONS = ["Female", "Male"];

// The risk levels the app already styles (riskStyles.js).
export const RISK_LEVEL_OPTIONS = ["Critical", "High", "Medium", "Stable"];

// Values accepted by the backend (CreatePatientDto: ^(A|B|AB|O)[+-]$).
export const BLOOD_GROUP_OPTIONS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

// No medical record number: it is not collected when a profile is created (and
// so never sent to POST /Patients; it stays null until a real one exists).
export const INITIAL_PROFILE_VALUES = {
  dateOfBirth: "",
  gender: "",
  bloodGroup: "",
  diagnosis: "",
  stage: "",
  treatment: "",
  protocol: "",
  riskLevel: "",
};

// Today as "yyyy-MM-dd" in Cairo, the date the backend compares birth dates to.
export const todayString = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Cairo" }).format(new Date());

export const validateProfile = (values) => {
  const errors = {};

  if (!values.dateOfBirth) {
    errors.dateOfBirth = "Date of birth is required.";
  } else if (values.dateOfBirth > todayString()) {
    errors.dateOfBirth = "Date of birth cannot be in the future.";
  }

  if (!values.gender) {
    errors.gender = "Gender is required.";
  }

  // Optional; when chosen it must be one of the listed groups.
  if (values.bloodGroup && !BLOOD_GROUP_OPTIONS.includes(values.bloodGroup)) {
    errors.bloodGroup = "Select a valid blood group.";
  }

  return errors;
};

// A patient (patientService shape) -> the edit form: all nine fields of
// PUT /Patients/{id}, "" where there is no value.
export const toProfileEditValues = (patient) => ({
  // "1978-04-15T00:00:00" -> "1978-04-15", as text so no time zone shifts it.
  dateOfBirth: patient.dateOfBirth?.slice(0, 10) ?? "",
  gender: patient.gender ?? "",
  bloodGroup: patient.bloodGroup ?? "",
  medicalRecordNumber: patient.medicalRecordNumber ?? "",
  diagnosis: patient.diagnosis ?? "",
  stage: patient.stage ?? "",
  treatment: patient.treatment ?? "",
  protocol: patient.protocol ?? "",
  riskLevel: patient.risk ?? "",
});

// Editing requires no field (any may be cleared); the backend checks the rest.
export const validateProfileEdit = (values, changed) =>
  changed.includes("dateOfBirth") && values.dateOfBirth > todayString()
    ? { dateOfBirth: "Date of birth cannot be in the future." }
    : {};

// Form values + the selected user's id -> the createPatientProfile payload.
export const toProfilePayload = (userId, values) => ({
  userId,
  ...values,
  // Date-only input sent as midnight UTC so the date never shifts.
  dateOfBirth: `${values.dateOfBirth}T00:00:00.000Z`,
});
