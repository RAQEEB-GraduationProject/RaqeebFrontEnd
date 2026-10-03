import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockUsers } from "../../data/mockUsers";
import { useAuthStore } from "../../store/authStore";

const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    setError("");

    const user = mockUsers.find(
      (user) => user.email === email.trim() && user.password === password,
    );

    if (!user) {
      setError("Invalid email or password.");
      return;
    }

    login(user);

    navigate(`/${user.role}/dashboard`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
        <h1 className="mb-2 text-3xl font-bold text-gray-800">RAQEEB</h1>

        <p className="mb-6 text-gray-500">Login to your account</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-lg border px-4 py-2 outline-none focus:ring-2"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-lg border px-4 py-2 outline-none focus:ring-2"
              required
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 py-2.5 font-medium text-white hover:bg-blue-700"
          >
            Login
          </button>
        </form>

        <div className="mt-6 rounded-lg bg-gray-50 p-4 text-sm">
          <p className="mb-2 font-semibold">Test Accounts:</p>

          <p>Doctor: doctor@raqeeb.com / 123456</p>
          <p>Nurse: nurse@raqeeb.com / 123456</p>
          <p>Admin: admin@raqeeb.com / 123456</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
