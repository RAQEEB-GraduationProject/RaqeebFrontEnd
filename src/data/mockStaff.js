// TODO: replace with API when backend is ready (staff list: doctors, nurses, caregivers)

export const STAFF_ROLES = [
  { value: "doctor", label: "Doctor" },
  { value: "nurse", label: "Nurse" },
  { value: "caregiver", label: "Caregiver" },
];

export const mockStaff = [
  { id: "d1", role: "doctor", name: "Emily Harris", detail: "Breast Oncology" },
  { id: "d2", role: "doctor", name: "Michael Turner", detail: "Medical Oncology" },
  { id: "d3", role: "doctor", name: "Sarah Collins", detail: "Surgical Oncology" },
  { id: "d4", role: "doctor", name: "David Morgan", detail: "Radiation Oncology" },
  { id: "d5", role: "doctor", name: "Laura Bennett", detail: "Hematology" },
  { id: "d6", role: "doctor", name: "Robert Hughes", detail: "Palliative Care" },

  { id: "n1", role: "nurse", name: "Jessica Moore", detail: "Infusion Unit" },
  { id: "n2", role: "nurse", name: "Thomas Clark", detail: "Oncology Ward" },
  { id: "n3", role: "nurse", name: "Hannah Lewis", detail: "Outpatient Clinic" },
  { id: "n4", role: "nurse", name: "Chris Walker", detail: "Oncology Ward" },
  { id: "n5", role: "nurse", name: "Megan Young", detail: "Infusion Unit" },
  { id: "n6", role: "nurse", name: "Peter Hall", detail: "Radiation Unit" },

  { id: "c1", role: "caregiver", name: "Daniel Bennett", detail: "Home care" },
  { id: "c2", role: "caregiver", name: "Grace Allen", detail: "Home care" },
  { id: "c3", role: "caregiver", name: "Samuel King", detail: "Family support" },
  { id: "c4", role: "caregiver", name: "Ruby Scott", detail: "Family support" },
  { id: "c5", role: "caregiver", name: "Henry Adams", detail: "Home care" },
  { id: "c6", role: "caregiver", name: "Chloe Baker", detail: "Patient companion" },
];
