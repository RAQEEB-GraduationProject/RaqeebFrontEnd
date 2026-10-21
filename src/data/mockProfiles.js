// TEMPORARY UI-ONLY PLACEHOLDERS for the Account/Profile pages.
// These are NOT real user data and are not connected to the backend or any store.
// TODO: replace with real profile data when the integration is approved.

export const placeholderAccount = {
  username: "username",
  email: "name@example.com",
  phoneNumber: "+000 000 000 0000",
  hospitalId: "000000",
  status: "Active",
};

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
