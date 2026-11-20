// Patient medical profile form (POST /Patients): values, validation and payload.
// Used by "Add hospital user" and by "Complete patient account".

export const GENDER_OPTIONS = ["Female", "Male"];

// The risk levels the app already styles (riskStyles.js).
export const RISK_LEVEL_OPTIONS = ["Critical", "High", "Medium", "Stable"];

export const INITIAL_PROFILE_VALUES = {
  dateOfBirth: "",
  gender: "",
  medicalRecordNumber: "",
  diagnosis: "",
  stage: "",
  treatment: "",
  protocol: "",
  riskLevel: "",
};

export const todayString = () => new Date().toISOString().slice(0, 10);

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

  if (!values.medicalRecordNumber.trim()) {
    errors.medicalRecordNumber = "Medical record number is required.";
  }

  return errors;
};

// Form values + the selected user's id -> the createPatientProfile payload.
export const toProfilePayload = (userId, values) => ({
  userId,
  ...values,
  // Date-only input sent as midnight UTC so the date never shifts.
  dateOfBirth: `${values.dateOfBirth}T00:00:00.000Z`,
});
