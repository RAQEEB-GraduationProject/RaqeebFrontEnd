import { Route, Navigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/admin/dashboard/AdminDashboard";
import UsersList from "../pages/admin/usersList/UsersList";
import PatientsList from "../pages/admin/patientsList/PatientsList";
import CtcaeRules from "../pages/admin/ctcaeRules/CtcaeRules";
import AlertsList from "../pages/admin/alertsList/AlertsList";
import Reports from "../pages/admin/reports/Reports";
import System from "../pages/admin/system/System";
import AdminProfile from "../pages/admin/profile/AdminProfile";

const adminRoutes = (
  <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<AdminDashboard />} />
    <Route path="users" element={<UsersList />} />
    <Route path="patients" element={<PatientsList />} />
    <Route path="ctcae" element={<CtcaeRules />} />
    <Route path="alerts" element={<AlertsList />} />
    <Route path="reports" element={<Reports />} />
    <Route path="system" element={<System />} />
    <Route path="profile" element={<AdminProfile />} />
  </Route>
);

export default adminRoutes;
