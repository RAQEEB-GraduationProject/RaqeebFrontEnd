import { Route, Navigate } from "react-router-dom";
import DoctorLayout from "../layouts/DoctorLayout";
import DoctorDashboard from "../pages/doctor/dashboard/DoctorDashboard";
import DoctorPatients from "../pages/doctor/doctorPatients/DoctorPatients";
import DoctorNotifications from "../pages/doctor/doctorNotifications/DoctorNotifications";
import DoctorAnalytics from "../pages/doctor/doctorAnalytics/DoctorAnalytics";
import DoctorAccount from "../pages/doctor/doctorAccount/DoctorAccount";

const DoctorRoutes = (
  <Route path="/doctor" element={<DoctorLayout />}>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<DoctorDashboard />} />
    <Route path="patients" element={<DoctorPatients />} />
    <Route path="notifications" element={<DoctorNotifications />} />
    <Route path="analytics" element={<DoctorAnalytics />} />
    <Route path="account" element={<DoctorAccount />} />
  </Route>
);

export default DoctorRoutes;
