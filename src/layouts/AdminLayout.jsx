import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate , useLocation  } from "react-router-dom";
import {
  Bell,
  ChevronRight,
  LayoutGrid,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  ClipboardCheck,
  BarChart3,
  UserPlus,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import Logo from "../components/brand/Logo";
import AdminSearch from "../components/search/AdminSearch";

const navItems = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutGrid },
  { label: "Users", to: "/admin/users", icon: UserPlus },
  { label: "Patients", to: "/admin/patients", icon: Users },
  { label: "CTCAE Rules", to: "/admin/ctcae", icon: ClipboardCheck },
  { label: "Alerts", to: "/admin/alerts", icon: Bell },
  { label: "Reports", to: "/admin/reports", icon: BarChart3 },
  { label: "System", to: "/admin/system", icon: Settings },
];

// Pages offered by the navbar search: the sidebar items plus the account page.
const searchPages = [
  ...navItems,
  {
    label: "Account settings",
    to: "/admin/profile",
    icon: UserRound,
    keywords: ["profile"],
  },
];

const getInitials = (name = "") =>
  name
    .replace(/^(dr\.?)\s+/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "AD";

const AdminLayout = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const searchRef = useRef(null);

  const displayName = user?.name || "Hospital Admin";
  const displayRole = user?.title || "Hospital Administrator";

  // Ctrl/⌘ + K يفتح البحث
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const location = useLocation();
  useEffect(() => {
    console.log("Layout path changed to:", location.pathname);
  }, [location.pathname]);

  return (
    <div data-theme="admin" className="min-h-screen bg-page text-ink">
      {/* overlay للموبايل */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-overlay/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ================= Sidebar ================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[298px] flex-col border-r border-line bg-gradient-to-b from-panel-from via-panel-via to-panel-to text-ink transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-7 pb-6 pt-9">
          <div className="flex items-center gap-3">
            <Logo className="h-10" />
            <div className="border-l border-line pl-3">
              <h2 className="text-lg font-bold tracking-[0.2em]">RAQEEB</h2>
              <p className="text-[11px] font-semibold tracking-[0.12em] text-ink-soft">
                ADMIN PORTAL
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1 text-ink-soft hover:bg-nav-hover lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-6 pt-6">
          <p className="mb-4 px-3 text-[10px] font-bold tracking-[0.18em] text-ink-soft">
            HOSPITAL OPERATIONS
          </p>

          <ul className="space-y-1.5">
            {navItems.map(({ label, to, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-4 rounded-xl border px-4 py-3.5 text-sm font-medium transition ${
                      isActive
                        ? "border-nav-indicator/40 bg-nav-active text-on-nav-active"
                        : "border-transparent text-ink-soft hover:bg-nav-hover/70 hover:text-ink"
                    }`
                  }
                >
                  <Icon size={20} strokeWidth={1.6} />
                  <span className="flex-1">{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="mx-6 border-t border-white py-5">
          <NavLink
            to="/admin/profile"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-1"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xs font-bold text-on-avatar">
              RH
            </div>
            <div>
              <p className="text-xs font-bold">RAQEEB Hospital</p>
              <p className="text-[11px] text-ink-soft">Single facility</p>
            </div>
          </NavLink>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-5 flex w-full items-center gap-3 rounded-lg px-1 py-2 text-sm text-ink-soft transition hover:text-ink"
          >
            <LogOut size={20} strokeWidth={1.6} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ================= Main ================= */}
      <div className="lg:pl-[298px]">
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-[90px] items-center gap-4 border-b border-line bg-white px-6 lg:px-11">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] bg-theme-strip"
          />

          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-ink-soft hover:bg-surface-muted lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <div className="shrink-0">
            <p className="text-[10px] font-bold tracking-[0.18em] text-accent">
              RAQEEB CANCER CENTER
            </p>
            <h1 className="text-base font-bold text-ink">
              Hospital Administration
            </h1>
          </div>

          {/* Search */}
          <AdminSearch inputRef={searchRef} pages={searchPages} />

          <div className="ml-auto flex items-center gap-5 md:ml-0">
            {/* Notifications */}
            <button
              type="button"
              onClick={() => navigate("/admin/alerts")}
              className="relative rounded-lg p-2 text-ink-soft transition hover:bg-surface-muted"
              aria-label="Open alerts"
            >
              <Bell size={22} strokeWidth={1.6} />
            </button>

            <div className="hidden h-10 w-px bg-line sm:block" />

            {/* Profile */}
            <button
              type="button"
              onClick={() => navigate("/admin/profile")}
              className="flex items-center gap-3 rounded-xl p-1 text-left transition hover:bg-surface-soft"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-avatar text-xs font-bold text-on-avatar">
                {getInitials(displayName)}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-ink">
                  {displayName}
                </p>
                <p className="text-[11px] text-muted-strong">{displayRole}</p>
              </div>
              <ChevronRight
                size={16}
                className="hidden text-muted sm:block"
              />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="px-6 py-10 lg:px-11">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
