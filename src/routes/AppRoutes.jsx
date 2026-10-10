import { Navigate, Route, Routes } from "react-router-dom";

import Login from "../pages/auth/Login";

import DoctorDashboard from "../pages/doctor/DoctorDashboard";
import NurseDashboard from "../pages/nurse/NurseDashboard";

import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import adminRoutes from "./adminRoutes";

import { useAuthStore } from "../store/authStore";

const AppRoutes = () => {
  const user = useAuthStore((state) => state.user);
  const fallback = user ? `/${user.role}/dashboard` : "/login";

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
        <Route element={<RoleRoute allowedRole="admin" />}>{adminRoutes}</Route>
      </Route>

      {/* Default */}
      <Route path="/" element={<Navigate to={fallback} replace />} />

      {/* Unknown Routes */}
      <Route path="*" element={<Navigate to={fallback} replace />} />
    </Routes>
  );
};

export default AppRoutes;
