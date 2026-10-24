import { Route, Navigate } from "react-router-dom";
import DoctorLayout from "../layouts/DoctorLayout";
import DoctorDashboard from "../pages/doctor/dashboard/DoctorDashboard";
import DoctorPatients from "../pages/doctor/doctorPatients/DoctorPatients";
import DoctorPatientDetails from "../pages/doctor/doctorPatientDetails/DoctorPatientDetails";
import PatientOverviewTab from "../pages/doctor/doctorPatientDetails/tabs/PatientOverviewTab";
import TreatmentTab from "../pages/doctor/doctorPatientDetails/tabs/TreatmentTab";
import MonitoringTab from "../pages/doctor/doctorPatientDetails/tabs/MonitoringTab";
import DiagnosticsTab from "../pages/doctor/doctorPatientDetails/tabs/DiagnosticsTab";
import PatientCareTab from "../pages/doctor/doctorPatientDetails/tabs/PatientCareTab";
import ClinicalAnalysisTab from "../pages/doctor/doctorPatientDetails/tabs/ClinicalAnalysisTab";
import AlertsTab from "../pages/doctor/doctorPatientDetails/tabs/AlertsTab";
import DoctorAlerts from "../pages/doctor/doctorAlerts/DoctorAlerts";
import DoctorNotifications from "../pages/doctor/doctorNotifications/DoctorNotifications";
import DoctorAnalytics from "../pages/doctor/doctorAnalytics/DoctorAnalytics";
import DoctorAccount from "../pages/doctor/doctorAccount/DoctorAccount";

const DoctorRoutes = (
  <Route path="/doctor" element={<DoctorLayout />}>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<DoctorDashboard />} />
    <Route path="patients" element={<DoctorPatients />} />
    <Route path="patients/:patientId" element={<DoctorPatientDetails />}>
      <Route index element={<Navigate to="overview" replace />} />
      <Route path="overview" element={<PatientOverviewTab />} />
      <Route path="treatment" element={<TreatmentTab />} />
      <Route path="monitoring" element={<MonitoringTab />} />
      <Route path="diagnostics" element={<DiagnosticsTab />} />
      <Route path="patient-care" element={<PatientCareTab />} />
      <Route path="clinical-analysis" element={<ClinicalAnalysisTab />} />
      <Route path="alerts" element={<AlertsTab />} />
    </Route>
    <Route path="alerts" element={<DoctorAlerts />} />
    <Route path="notifications" element={<DoctorNotifications />} />
    <Route path="analytics" element={<DoctorAnalytics />} />
    <Route path="account" element={<DoctorAccount />} />
  </Route>
);

export default DoctorRoutes;
