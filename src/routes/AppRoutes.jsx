import { Navigate, Route, Routes } from "react-router-dom";

import Login from "../pages/auth/Login";

import DoctorDashboard from "../pages/doctor/DoctorDashboard";
import NurseDashboard from "../pages/nurse/NurseDashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";

import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        {/* Doctor */}
        <Route element={<RoleRoute allowedRole="doctor" />}>
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        </Route>

        {/* Nurse */}
        <Route element={<RoleRoute allowedRole="nurse" />}>
          <Route path="/nurse/dashboard" element={<NurseDashboard />} />
        </Route>

        {/* Admin */}
        <Route element={<RoleRoute allowedRole="admin" />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>
      </Route>

      {/* Default */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Unknown Routes */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
