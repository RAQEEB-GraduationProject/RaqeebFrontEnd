import { Route, Navigate } from "react-router-dom";
import NurseLayout from "../layouts/NurseLayout";
import NurseDashboard from "../pages/nurse/dashboard/NurseDashboard";
import NursePatients from "../pages/nurse/nursePatients/NursePatients";
import DoctorPatientDetails from "../pages/doctor/doctorPatientDetails/DoctorPatientDetails";
import PatientOverviewTab from "../pages/doctor/doctorPatientDetails/tabs/PatientOverviewTab";
import TreatmentTab from "../pages/doctor/doctorPatientDetails/tabs/TreatmentTab";
import MonitoringTab from "../pages/doctor/doctorPatientDetails/tabs/MonitoringTab";
import DiagnosticsTab from "../pages/doctor/doctorPatientDetails/tabs/DiagnosticsTab";
import PatientCareTab from "../pages/doctor/doctorPatientDetails/tabs/PatientCareTab";
import ClinicalAnalysisTab from "../pages/doctor/doctorPatientDetails/tabs/ClinicalAnalysisTab";
import AlertsTab from "../pages/doctor/doctorPatientDetails/tabs/AlertsTab";
import NurseAlerts from "../pages/nurse/nurseAlerts/NurseAlerts";
import NurseCheckIns from "../pages/nurse/nurseCheckIns/NurseCheckIns";
import NurseMedications from "../pages/nurse/nurseMedications/NurseMedications";
import NurseAccount from "../pages/nurse/nurseAccount/NurseAccount";

const NurseRoutes = (
  <Route path="/nurse" element={<NurseLayout />}>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<NurseDashboard />} />
    <Route path="patients" element={<NursePatients />} />
    {/* Same patient details UI as the doctor's, without the doctor-only actions. */}
    <Route
      path="patients/:patientId"
      element={<DoctorPatientDetails listPath="/nurse/patients" actions={null} />}
    >
      <Route index element={<Navigate to="overview" replace />} />
      <Route path="overview" element={<PatientOverviewTab />} />
      <Route path="treatment" element={<TreatmentTab />} />
      <Route path="monitoring" element={<MonitoringTab />} />
      <Route path="diagnostics" element={<DiagnosticsTab />} />
      <Route path="patient-care" element={<PatientCareTab />} />
      <Route path="clinical-analysis" element={<ClinicalAnalysisTab />} />
      <Route path="alerts" element={<AlertsTab />} />
    </Route>
    <Route path="alerts" element={<NurseAlerts />} />
    <Route path="check-ins" element={<NurseCheckIns />} />
    <Route path="medications" element={<NurseMedications />} />
    <Route path="account" element={<NurseAccount />} />
  </Route>
);

export default NurseRoutes;
