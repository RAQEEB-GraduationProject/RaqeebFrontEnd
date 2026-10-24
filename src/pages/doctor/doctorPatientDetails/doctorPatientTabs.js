// Doctor tabs, in display order. `to` is relative to /doctor/patients/:patientId
// and must match the child routes in routes/DoctorRoutes.jsx.
export const doctorPatientTabs = [
  { label: "Patient Overview", to: "overview" },
  { label: "Treatment", to: "treatment" },
  { label: "Monitoring", to: "monitoring" },
  { label: "Diagnostics", to: "diagnostics" },
  { label: "Patient Care", to: "patient-care" },
  { label: "Clinical Analysis", to: "clinical-analysis" },
  { label: "Alerts", to: "alerts" },
];
