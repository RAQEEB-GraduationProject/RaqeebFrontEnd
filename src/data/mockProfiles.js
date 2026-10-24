// The only legitimate per-role differences: heading text, role label, theme.
export const profileRoleConfig = {
  admin: {
    title: "Account settings",
    description: "View your administrator account information.",
    roleLabel: "Admin",
  },
  doctor: {
    title: "Account profile",
    description: "View your doctor account information.",
    roleLabel: "Doctor",
  },
  nurse: {
    title: "Account",
    description: "View your nurse account information.",
    roleLabel: "Nurse",
  },
};
