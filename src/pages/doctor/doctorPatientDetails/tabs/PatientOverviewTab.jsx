import PatientOverview from "../../../../components/patientDetails/overview/PatientOverview";

// Route entry of the "overview" tab for every role (Admin, Doctor, Nurse).
// The UI and data loading are role-agnostic and live in components/patientDetails.
const PatientOverviewTab = () => <PatientOverview />;

export default PatientOverviewTab;
