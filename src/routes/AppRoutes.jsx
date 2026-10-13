import { Navigate, Route, Routes } from "react-router-dom";

import Login from "../pages/auth/Login";

import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";
import adminRoutes from "./adminRoutes";
import doctorRoutes from "./DoctorRoutes";
import nurseRoutes from "./NurseRoutes";

import { useAuthStore } from "../store/authStore";

const AppRoutes = () => {
  const user = useAuthStore((state) => state.user);
  const fallback = user ? `/${user.role}/dashboard` : "/login";

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes (لازم يكون عامل login) */}
      <Route element={<ProtectedRoute />}>
        {/* Doctor (role = doctor بس) */}
        <Route element={<RoleRoute allowedRole="doctor" />}>
          {doctorRoutes}
        </Route>

        {/* Nurse (role = nurse بس) */}
        <Route element={<RoleRoute allowedRole="nurse" />}>{nurseRoutes}</Route>

        {/* Admin (role = admin بس) */}
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
