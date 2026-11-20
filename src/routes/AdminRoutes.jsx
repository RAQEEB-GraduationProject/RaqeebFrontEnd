import { Route, Navigate } from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/admin/dashboard/AdminDashboard";
import UsersList from "../pages/admin/usersList/UsersList";
import AddUser from "../pages/admin/usersList/AddUser";
import UserDetails from "../pages/admin/usersList/UserDetails";
import PatientsList from "../pages/admin/patientsList/PatientsList";
import PatientProfileMissing from "../pages/admin/patientsList/PatientProfileMissing";
import CompletePatientAccount from "../pages/admin/patientsList/CompletePatientAccount";
import DoctorPatientDetails from "../pages/doctor/doctorPatientDetails/DoctorPatientDetails";
import PatientOverviewTab from "../pages/doctor/doctorPatientDetails/tabs/PatientOverviewTab";
import TreatmentTab from "../pages/doctor/doctorPatientDetails/tabs/TreatmentTab";
import MonitoringTab from "../pages/doctor/doctorPatientDetails/tabs/MonitoringTab";
import DiagnosticsTab from "../pages/doctor/doctorPatientDetails/tabs/DiagnosticsTab";
import PatientCareTab from "../pages/doctor/doctorPatientDetails/tabs/PatientCareTab";
import ClinicalAnalysisTab from "../pages/doctor/doctorPatientDetails/tabs/ClinicalAnalysisTab";
import AlertsTab from "../pages/doctor/doctorPatientDetails/tabs/AlertsTab";
import CtcaeRules from "../pages/admin/ctcaeRules/CtcaeRules";
import AlertsList from "../pages/admin/alertsList/AlertsList";
import Reports from "../pages/admin/reports/Reports";
import System from "../pages/admin/system/System";
import AdminProfile from "../pages/admin/profile/AdminProfile";

const adminRoutes = (
  <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<Navigate to="dashboard" replace />} />

    <Route path="dashboard" element={<AdminDashboard />} />

    {/* Users */}
    <Route path="users" element={<UsersList />} />
    <Route path="users/new" element={<AddUser />} />
    <Route path="users/:id" element={<UserDetails />} />

    <Route path="patients" element={<PatientsList />} />
    {/* Patient users without a medical profile (the id is the USER id). */}
    <Route path="patients/users/:userId" element={<PatientProfileMissing />} />
    <Route path="patients/users/:userId/complete" element={<CompletePatientAccount />} />
    {/* Same patient details UI as the doctor's, without the doctor-only actions. */}
    <Route
      path="patients/:patientId"
      element={<DoctorPatientDetails listPath="/admin/patients" actions={null} />}
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
    <Route path="ctcae" element={<CtcaeRules />} />
    <Route path="alerts" element={<AlertsList />} />
    <Route path="reports" element={<Reports />} />
    <Route path="system" element={<System />} />
    <Route path="profile" element={<AdminProfile />} />
  </Route>
);

export default adminRoutes;
