import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronRight,
  LayoutGrid,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  ClipboardCheck,
  BarChart3,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";

// ---- Sidebar items (غيّر المسارات لو الـ routes عندك مختلفة) ----
const navItems = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutGrid },
  { label: "Users", to: "/admin/users", icon: UserPlus },
  { label: "Patients", to: "/admin/patients", icon: Users },
  { label: "CTCAE Rules", to: "/admin/ctcae", icon: ClipboardCheck },
  { label: "Alerts", to: "/admin/alerts", icon: Bell, badgeKey: "alerts" },
  { label: "Reports", to: "/admin/reports", icon: BarChart3 },
  { label: "System", to: "/admin/system", icon: Settings },
];

// TODO: استبدلها بالعدد الحقيقي من الـ API / store لما يجهز
const OPEN_ALERTS_COUNT = 7;

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
  const badges = { alerts: OPEN_ALERTS_COUNT };

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

  return (
    <div className="min-h-screen bg-[#f3f6f6] text-slate-800">
      {/* overlay للموبايل */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ================= Sidebar ================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[298px] flex-col bg-gradient-to-b from-[#08263a] via-[#0a2f45] to-[#0b3a4a] text-white transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-9 pb-6 pt-9">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-300 to-teal-500 text-base font-bold text-[#08263a]">
              R
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-[0.2em]">RAQEEB</h2>
              <p className="text-[11px] font-semibold tracking-[0.12em] text-teal-100/70">
                ADMIN PORTAL
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1 text-white/70 hover:bg-white/10 lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-6 pt-6">
          <p className="mb-4 px-3 text-[10px] font-bold tracking-[0.18em] text-teal-100/50">
            HOSPITAL OPERATIONS
          </p>

          <ul className="space-y-1.5">
            {navItems.map(({ label, to, icon: Icon, badgeKey }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-4 rounded-xl border px-4 py-3.5 text-sm font-medium transition ${
                      isActive
                        ? "border-white/90 bg-white/10 text-white"
                        : "border-transparent text-teal-50/80 hover:bg-white/5 hover:text-white"
                    }`
                  }
                >
                  <Icon size={20} strokeWidth={1.6} />
                  <span className="flex-1">{label}</span>
                  {badgeKey && badges[badgeKey] > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white">
                      {badges[badgeKey]}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="mx-6 border-t border-white/10 py-5">
          <div className="flex items-center gap-3 px-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xs font-bold">
              RH
            </div>
            <div>
              <p className="text-xs font-bold">RAQEEB Hospital</p>
              <p className="text-[11px] text-teal-100/60">Single facility</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-5 flex w-full items-center gap-3 rounded-lg px-1 py-2 text-sm text-teal-50/80 transition hover:text-white"
          >
            <LogOut size={20} strokeWidth={1.6} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ================= Main ================= */}
      <div className="lg:pl-[298px]">
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-[90px] items-center gap-4 border-b border-slate-200 bg-white px-6 lg:px-11">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>

          <div className="shrink-0">
            <p className="text-[10px] font-bold tracking-[0.18em] text-teal-700">
              RAQEEB CANCER CENTER
            </p>
            <h1 className="text-base font-bold text-[#0b2a3d]">
              Hospital Administration
            </h1>
          </div>

          {/* Search */}
          <div className="relative mx-auto hidden w-full max-w-[640px] md:block">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              ref={searchRef}
              type="search"
              placeholder="Search users, patients or alerts…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-16 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-600/20"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-400">
              ⌘ K
            </kbd>
          </div>

          <div className="ml-auto flex items-center gap-5 md:ml-0">
            {/* Notifications */}
            <button
              type="button"
              onClick={() => navigate("/admin/alerts")}
              className="relative rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
              aria-label="Open alerts"
            >
              <Bell size={22} strokeWidth={1.6} />
              {OPEN_ALERTS_COUNT > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </button>

            <div className="hidden h-10 w-px bg-slate-200 sm:block" />

            {/* Profile */}
            <button
              type="button"
              onClick={() => navigate("/admin/profile")}
              className="flex items-center gap-3 rounded-xl p-1 text-left transition hover:bg-slate-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-xs font-bold text-teal-800">
                {getInitials(displayName)}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-[#0b2a3d]">
                  {displayName}
                </p>
                <p className="text-[11px] text-slate-500">{displayRole}</p>
              </div>
              <ChevronRight
                size={16}
                className="hidden text-slate-400 sm:block"
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
