import PatientDiagnostics from "../../../../components/patientDetails/diagnostics/PatientDiagnostics";

// Route entry of the "diagnostics" tab for every role (Admin, Doctor, Nurse).
// The UI and data loading are role-agnostic and live in components/patientDetails.
const DiagnosticsTab = () => <PatientDiagnostics />;

export default DiagnosticsTab;
