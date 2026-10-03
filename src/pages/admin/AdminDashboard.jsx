import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Admin Dashboard</p>

            <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-500 px-5 py-2 text-white hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
