import { Route, Navigate } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";

const adminRoutes = (
  <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<AdminDashboard />} />
    {/* باقي الصفحات هتتضاف هنا بعدين:
    <Route path="users" element={<UsersList />} />
    <Route path="patients" element={<PatientsList />} />
    <Route path="ctcae" element={<CtcaeRules />} />
    <Route path="alerts" element={<AlertsList />} />
    <Route path="reports" element={<Reports />} />
    <Route path="system" element={<System />} /> */}
  </Route>
);

export default adminRoutes;
