import PatientCare from "../../../../components/patientDetails/care/PatientCare";

// Route entry of the "patient-care" tab for every role (Admin, Doctor, Nurse).
// The UI and data loading are role-agnostic and live in components/patientDetails.
const PatientCareTab = () => <PatientCare />;

export default PatientCareTab;
