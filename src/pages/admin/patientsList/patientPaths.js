// Admin patient URLs.
export const PATIENTS_PATH = "/admin/patients";

// Patient users without a medical profile; the id here is the USER id.
export const patientUserPath = (userId) => `${PATIENTS_PATH}/users/${userId}`;
export const completePatientPath = (userId) => `${patientUserPath(userId)}/complete`;
