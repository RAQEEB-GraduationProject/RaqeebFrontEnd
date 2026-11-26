import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Bell,
  ChevronRight,
  LayoutGrid,
  LogOut,
  Menu,
  TriangleAlert,
  Users,
  X,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import Logo from "../components/brand/Logo";

// ---- Top navbar items (to لازم يطابق path في DoctorRoutes.jsx) ----
const navItems = [
  { label: "Dashboard", to: "/doctor/dashboard", icon: LayoutGrid },
  { label: "Patients", to: "/doctor/patients", icon: Users },
  { label: "Alerts", to: "/doctor/alerts", icon: TriangleAlert },
  { label: "Analytics", to: "/doctor/analytics", icon: BarChart3 },
];

// TODO: استبدلها بالحالة الحقيقية من الـ API / store لما يجهز
const HAS_UNREAD_NOTIFICATIONS = true;

const getInitials = (name = "") =>
  name
    .replace(/^(dr\.?)\s+/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "DR";

const linkClass = ({ isActive }) =>
  `relative flex items-center gap-3 rounded-2xl px-5 py-3 text-[15px] font-medium transition ${
    isActive
      ? "bg-nav-active text-on-nav-active"
      : "text-ink-soft hover:bg-nav-hover hover:text-ink"
  }`;

const DoctorLayout = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [mobileOpen, setMobileOpen] = useState(false);

  const displayName = user?.name || "Doctor";
  const displayRole = user?.specialty || user?.title || "Medical Oncologist";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  // Esc يقفل القائمة على الموبايل
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div data-theme="doctor" className="min-h-screen bg-page text-ink">
      {/* ================= Top navbar ================= */}
      <header className="sticky top-0 z-30 border-b border-line bg-gradient-to-r from-white to-header-tint">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] bg-theme-strip"
        />
        <div className="flex h-[92px] items-center justify-between gap-4 px-6 xl:grid xl:grid-cols-[1fr_auto_1fr] xl:px-12">
          {/* Brand */}
          <NavLink to="/doctor/dashboard" className="flex items-center gap-4">
            <Logo className="h-10 sm:h-11" />
            <div className="hidden border-l border-line pl-4 sm:block">
              <h2 className="text-base font-bold tracking-[0.15em] text-ink">
                RAQEEB
              </h2>
              <p className="text-xs text-muted">Clinical monitoring</p>
            </div>
          </NavLink>

          {/* Desktop nav (center) */}
          <nav className="hidden items-center gap-2 xl:flex">
            {navItems.map(({ label, to, icon: Icon }) => (
              <NavLink key={to} to={to} className={linkClass}>
                <Icon size={20} strokeWidth={1.6} />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center justify-end gap-4">
            {/* Bell */}
            <button
              type="button"
              onClick={() => navigate("/doctor/notifications")}
              className="relative rounded-lg p-2 text-muted-strong transition hover:bg-surface-soft"
              aria-label="Open notifications"
            >
              <Bell size={22} strokeWidth={1.6} />
              {HAS_UNREAD_NOTIFICATIONS && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-highlight ring-2 ring-white" />
              )}
            </button>

            <div className="hidden h-10 w-px bg-line sm:block" />

            {/* Profile */}
            <button
              type="button"
              onClick={() => navigate("/doctor/account")}
              className="flex items-center gap-3 rounded-xl p-1 text-left transition hover:bg-surface-soft"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-avatar text-xs font-semibold text-on-avatar">
                {getInitials(displayName)}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-ink">
                  {displayName}
                </p>
                <p className="text-xs text-muted">{displayRole}</p>
              </div>
              <ChevronRight
                size={16}
                className="hidden text-muted sm:block"
              />
            </button>

            {/* Sign out */}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg p-2 text-muted-strong transition hover:bg-surface-soft hover:text-danger-text"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut size={20} strokeWidth={1.6} />
            </button>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className="rounded-lg p-2 text-ink-soft hover:bg-surface-muted xl:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <nav className="space-y-1 border-t border-line-soft px-4 py-3 xl:hidden">
            {navItems.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={linkClass}
              >
                <Icon size={20} strokeWidth={1.6} />
                {label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      {/* ================= Page content ================= */}
      <main className="mx-auto w-full max-w-[1400px] px-6 py-10 lg:px-12">
        <Outlet />
      </main>
    </div>
  );
};

export default DoctorLayout;
