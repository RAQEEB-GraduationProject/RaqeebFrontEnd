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
