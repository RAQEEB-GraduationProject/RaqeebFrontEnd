import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";

const DoctorAccount = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleLogout}
        className="rounded-lg border px-4 py-2"
      >
        Logout
      </button>
    </div>
  );
};

export default DoctorAccount;
