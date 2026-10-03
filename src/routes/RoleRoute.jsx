import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const RoleRoute = ({ allowedRole }) => {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== allowedRole) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return <Outlet />;
};

export default RoleRoute;
