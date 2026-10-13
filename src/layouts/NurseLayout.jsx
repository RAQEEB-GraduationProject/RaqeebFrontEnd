import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  Check,
  ChevronRight,
  LayoutGrid,
  Menu,
  Pill,
  User,
  Users,
  X,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";

// ---- Top navbar items (to لازم يطابق path في NurseRoutes.jsx) ----
const navItems = [
  { label: "Dashboard", to: "/nurse/dashboard", icon: LayoutGrid },
  { label: "Patients", to: "/nurse/patients", icon: Users },
  { label: "Alerts", to: "/nurse/alerts", icon: Bell, showDot: true },
  { label: "Check-ins", to: "/nurse/check-ins", icon: Check },
  { label: "Medications", to: "/nurse/medications", icon: Pill },
];

// TODO: استبدلها بالحالة الحقيقية من الـ API / store لما يجهز
const HAS_OPEN_ALERTS = true;

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "NU";

const linkClass = ({ isActive }) =>
  `relative flex items-center gap-3 rounded-2xl border-b-[3px] px-5 py-3 text-[15px] font-medium transition ${
    isActive
      ? "border-[#8ccbbd] bg-[#e3f3ee] text-[#2f7f73]"
      : "border-transparent text-slate-600 hover:bg-[#f1f8f6] hover:text-slate-900"
  }`;

const NurseLayout = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [mobileOpen, setMobileOpen] = useState(false);

  const displayName = user?.name || "Nurse";
  const displayRole = user?.shift
    ? `Nurse · ${user.shift}`
    : "Nurse · Morning shift";

  // Esc يقفل القائمة على الموبايل
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f9f7] text-slate-800">
      {/* ================= Top navbar ================= */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-gradient-to-r from-white to-[#f3faf8]">
        <div className="flex h-[92px] items-center justify-between gap-4 px-6 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:px-12">
          {/* Brand */}
          <div className="flex items-center gap-4">
            <NavLink to="/nurse/dashboard" className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#d4efe7] to-[#a9ddd0] text-lg font-bold text-[#2f7f73] shadow-sm">
                R
              </div>
              <div className="flex items-baseline gap-1">
                <h2 className="text-base font-bold tracking-[0.15em] text-[#1f3d38]">
                  RAQEEB
                </h2>
                <span className="hidden text-xs text-slate-400 sm:inline">
                  Nursing station
                </span>
              </div>
            </NavLink>

            <span className="hidden rounded-full bg-[#e3f3ee] px-3 py-1 text-[10px] font-bold tracking-[0.1em] text-[#2f7f73] xl:inline">
              ON SHIFT
            </span>
          </div>

          {/* Desktop nav (center) */}
          <nav className="hidden items-center gap-2 lg:flex">
            {navItems.map(({ label, to, icon: Icon, showDot }) => (
              <NavLink key={to} to={to} className={linkClass}>
                <Icon size={20} strokeWidth={1.6} />
                {label}
                {showDot && HAS_OPEN_ALERTS && (
                  <span className="absolute right-2 top-1.5 h-2 w-2 rounded-full bg-rose-500" />
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center justify-end gap-4">
            {/* Bell */}
            <button
              type="button"
              onClick={() => navigate("/nurse/alerts")}
              className="relative rounded-lg p-2 text-slate-500 transition hover:bg-[#f1f8f6]"
              aria-label="Open alerts"
            >
              <Bell size={22} strokeWidth={1.6} />
              {HAS_OPEN_ALERTS && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>

            <div className="hidden h-10 w-px bg-slate-200 sm:block" />

            {/* Profile */}
            <button
              type="button"
              onClick={() => navigate("/nurse/account")}
              className="flex items-center gap-3 rounded-xl p-1 text-left transition hover:bg-[#f1f8f6]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e3f3ee] text-xs font-semibold text-[#2f7f73]">
                {getInitials(displayName)}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-800">
                  {displayName}
                </p>
                <p className="text-xs text-slate-400">{displayRole}</p>
              </div>
              <ChevronRight
                size={16}
                className="hidden text-slate-400 sm:block"
              />
            </button>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <nav className="space-y-1 border-t border-slate-100 px-4 py-3 lg:hidden">
            {navItems.map(({ label, to, icon: Icon, showDot }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={linkClass}
              >
                <Icon size={20} strokeWidth={1.6} />
                {label}
                {showDot && HAS_OPEN_ALERTS && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-rose-500" />
                )}
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

export default NurseLayout;
