// الـ roles اللي ليها داشبورد في الموقع (بحروف صغيرة، بعد ما بنحوّل اللي جاي من الباك)
export const ROLES = {
  ADMIN: "admin",
  DOCTOR: "doctor",
  NURSE: "nurse",
};

const DASHBOARD_PATHS = {
  [ROLES.ADMIN]: "/admin/dashboard",
  [ROLES.DOCTOR]: "/doctor/dashboard",
  [ROLES.NURSE]: "/nurse/dashboard",
};

// بترجّع مسار داشبورد الـ role، أو null لو الـ role ملهوش داشبورد (زي Patient / Caregiver)
export const getDashboardPath = (role) => DASHBOARD_PATHS[role] ?? null;

// POST /Patients/{id}/medical-history is [Authorize(Roles = "Admin,Doctor")]
// (a doctor only for assigned patients). This only hides the action; the
// backend still decides (403 / 404).
export const canAddMedicalHistory = (role) =>
  role === ROLES.ADMIN || role === ROLES.DOCTOR;

// POST /Patients/{id}/journal and /appointments are [Authorize(Roles =
// "Admin,Doctor")] too (a doctor only for assigned patients). Hides the action
// only; the backend still decides.
export const canAddPatientCare = canAddMedicalHistory;
