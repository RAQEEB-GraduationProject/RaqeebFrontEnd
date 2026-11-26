import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { getDashboardPath } from "../../utils/roles";
import Logo from "../../components/brand/Logo";

const Login = () => {
  const navigate = useNavigate();

  const login = useAuthStore((state) => state.login);
  const clearError = useAuthStore((state) => state.clearError);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(false);

  // امسح أي error قديم لما الصفحة تفتح
  useEffect(() => {
    clearError();
  }, [clearError]);

  // لو عامل login فعلاً (أو لسه عامل login دلوقتي) → روح على داشبورد الـ role بتاعه
  const dashboardPath = user ? getDashboardPath(user.role) : null;
  if (isAuthenticated && dashboardPath) {
    return <Navigate to={dashboardPath} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    // لو نجح، الـ store بيتحدث والـ <Navigate> اللي فوق بيحوّلك تلقائي
    await login({ userName: userName.trim(), password });
  };

  const handleChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) clearError();
  };

  const inputClass =
    "w-full rounded-xl border border-field bg-white px-4 py-4 text-sm text-ink placeholder:text-muted outline-none transition focus:border-focus focus:ring-2 focus:ring-focus/25 disabled:cursor-not-allowed disabled:bg-surface-soft";

  return (
    <div className="flex min-h-screen w-full bg-page">
      {/* ========== Left panel (brand) ========== */}
      <div className="relative hidden w-[42%] flex-col justify-between overflow-hidden bg-gradient-to-b from-panel-from via-panel-via to-panel-to p-10 lg:flex xl:p-[70px]">
        {/* soft glow */}
        <div className="pointer-events-none absolute bottom-0 left-0 h-[420px] w-[420px] rounded-full bg-white/60 blur-3xl" />

        {/* Logo */}
        <div className="relative flex flex-wrap items-center gap-4">
          <Logo className="h-16" />
          <div className="border-l border-line-strong pl-4">
            <h2 className="text-lg font-bold tracking-[0.2em] text-ink">
              RAQEEB
            </h2>
            <p className="text-xs font-medium text-ink-soft">
              Hospital command center
            </p>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative">
          <span
            aria-hidden="true"
            className="mb-5 block h-1 w-16 rounded-full bg-brand-gradient"
          />
          <p className="mb-6 text-xs font-bold tracking-[0.2em] text-accent-strong">
            SECURE CLINICAL OPERATIONS
          </p>
          <h1 className="text-6xl font-light leading-[1.05] text-ink">
            One hospital.
            <br />
            One clear view.
          </h1>
          <p className="mt-8 max-w-md text-lg leading-8 text-ink-soft">
            Monitor care delivery, system performance, and every patient
            touchpoint from one secure workspace.
          </p>
        </div>

        {/* Status card */}
        <div className="relative flex w-fit items-center gap-4 rounded-2xl border border-white bg-white/60 px-5 py-4 backdrop-blur-sm">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-success" />
          </span>
          <div>
            <p className="text-xs font-bold text-ink">
              All systems operational
            </p>
            <p className="text-xs text-ink-soft">
              Protected by enterprise-grade security
            </p>
          </div>
        </div>
      </div>

      {/* ========== Right panel (form) ========== */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-[512px]">
          <p className="mb-4 text-xs font-bold tracking-[0.2em] text-accent">
            WELCOME BACK
          </p>
          <h1 className="mb-3 text-4xl font-medium text-ink">
            Sign in to RAQEEB
          </h1>
          <p className="mb-10 text-sm text-muted-strong">
            Use your hospital account to continue.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <label
                htmlFor="userName"
                className="mb-2 block text-xs font-semibold text-ink"
              >
                Username
              </label>
              <input
                id="userName"
                type="text"
                value={userName}
                onChange={handleChange(setUserName)}
                placeholder="Enter your username"
                autoComplete="username"
                maxLength={100}
                className={inputClass}
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs font-semibold text-ink"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={handleChange(setPassword)}
                placeholder="Enter your password"
                autoComplete="current-password"
                maxLength={128}
                className={inputClass}
                disabled={isLoading}
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-strong">
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(e) => setKeepSignedIn(e.target.checked)}
                  className="h-4 w-4 rounded border-line-strong accent-accent"
                />
                Keep me signed in
              </label>

              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-xs font-semibold text-accent hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-lg bg-danger-bg px-4 py-3 text-sm text-danger-text"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading || !userName.trim() || !password}
              aria-busy={isLoading}
              className="w-full rounded-xl bg-primary py-4 text-sm font-bold text-on-primary shadow-lg shadow-ink/20 transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-focus focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-disabled disabled:text-on-disabled disabled:shadow-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Signing in…
                </span>
              ) : (
                "Sign in securely"
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-xs text-muted">
            Need help? Contact Hospital IT at{" "}
            <span className="font-bold text-ink-soft">ext. 2400</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
