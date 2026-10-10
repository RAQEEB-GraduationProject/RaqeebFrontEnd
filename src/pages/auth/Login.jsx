import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockUsers } from "../../data/mockUsers";
import { useAuthStore } from "../../store/authStore";

const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(false);
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

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20";

  return (
    <div className="flex min-h-screen w-full bg-[#f7f9f8]">
      {/* ========== Left panel (brand) ========== */}
      <div className="relative hidden w-[42%] flex-col justify-between overflow-hidden bg-gradient-to-b from-[#08243a] via-[#0b3347] to-[#0e3b49] p-[70px] lg:flex">
        {/* soft glow */}
        <div className="pointer-events-none absolute bottom-0 left-0 h-[420px] w-[420px] rounded-full bg-teal-400/10 blur-3xl" />

        {/* Logo */}
        <div className="relative flex items-center gap-4">
          <div className="flex h-[50px] w-[50px] items-center justify-center rounded-xl bg-gradient-to-br from-teal-300 to-teal-500 text-lg font-bold text-[#08243a]">
            R
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-[0.2em] text-white">
              RAQEEB
            </h2>
            <p className="text-xs font-medium text-teal-100/80">
              Hospital command center
            </p>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative">
          <p className="mb-6 text-xs font-bold tracking-[0.2em] text-teal-300">
            SECURE CLINICAL OPERATIONS
          </p>
          <h1 className="text-6xl font-light leading-[1.05] text-white">
            One hospital.
            <br />
            One clear view.
          </h1>
          <p className="mt-8 max-w-md text-lg leading-8 text-teal-50/80">
            Monitor care delivery, system performance, and every patient
            touchpoint from one secure workspace.
          </p>
        </div>

        {/* Status card */}
        <div className="relative flex w-fit items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400" />
          </span>
          <div>
            <p className="text-xs font-bold text-white">
              All systems operational
            </p>
            <p className="text-xs text-teal-100/70">
              Protected by enterprise-grade security
            </p>
          </div>
        </div>
      </div>

      {/* ========== Right panel (form) ========== */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-[512px]">
          <p className="mb-4 text-xs font-bold tracking-[0.2em] text-teal-500">
            WELCOME BACK
          </p>
          <h1 className="mb-3 text-4xl font-medium text-[#0b2a3d]">
            Sign in to RAQEEB
          </h1>
          <p className="mb-10 text-sm text-slate-500">
            Use your hospital account to continue.
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-semibold text-slate-800"
              >
                Hospital email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@raqeeb.care"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs font-semibold text-slate-800"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={inputClass}
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-500">
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(e) => setKeepSignedIn(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-teal-700"
                />
                Keep me signed in
              </label>

              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-xs font-semibold text-teal-700 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-[#0e4f5c] py-4 text-sm font-bold text-white shadow-lg shadow-teal-900/20 transition hover:bg-[#0b424d] focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
            >
              Sign in securely
            </button>
          </form>

          <p className="mt-10 text-center text-xs text-slate-400">
            Need help? Contact Hospital IT at{" "}
            <span className="font-bold text-slate-600">ext. 2400</span>
          </p>

          {/* Test accounts (احذفه قبل الـ Production) */}
          <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-4 text-xs text-slate-500">
            <p className="mb-2 font-semibold text-slate-700">Test accounts</p>
            <p>Doctor: doctor@raqeeb.com / 123456</p>
            <p>Nurse: nurse@raqeeb.com / 123456</p>
            <p>Admin: admin@raqeeb.com / 123456</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
