import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight, Plus, Search } from "lucide-react";

import { useUserStore } from "../../../store/userStore";

const ROLE_OPTIONS = ["Admin", "Doctor", "Nurse", "Caregiver", "Patient"].map(
  (role) => ({
    value: role.toLowerCase(),
    label: role,
  }),
);

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const GRID =
  "grid grid-cols-[minmax(240px,2.2fr)_minmax(110px,1fr)_minmax(150px,1.3fr)_minmax(110px,1fr)_32px] items-center gap-4 px-6";

const getInitials = (name = "") => {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (!words.length) return "?";

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return (words[0][0] + words[1][0]).toUpperCase();
};

const FilterSelect = ({ label, value, onChange, allLabel, options }) => (
  <div className="relative w-full sm:w-[170px]">
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full appearance-none rounded-xl border border-field bg-white py-3 pl-4 pr-10 text-sm text-ink-soft outline-none transition focus:border-focus focus:ring-2 focus:ring-focus/25"
    >
      <option value="all">{allLabel}</option>

      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>

    <ChevronDown
      size={16}
      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-strong"
    />
  </div>
);

const RoleBadge = ({ role }) => (
  <span className="inline-flex w-fit rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-strong">
    {role || "—"}
  </span>
);

const StatusBadge = ({ isActive }) => (
  <span className="inline-flex items-center gap-2 text-xs text-ink-soft">
    <span
      className={`h-2 w-2 rounded-full ${
        isActive ? "bg-success" : "bg-danger"
      }`}
    />

    {isActive ? "Active" : "Inactive"}
  </span>
);

const SkeletonRows = () => (
  <div aria-busy="true" aria-label="Loading users">
    {Array.from({ length: 5 }).map((_, index) => (
      <div
        key={index}
        className={`${GRID} animate-pulse border-t border-line-soft py-5`}
      >
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-surface-muted" />

          <div className="space-y-2">
            <div className="h-3 w-28 rounded bg-surface-muted" />
            <div className="h-2.5 w-40 rounded bg-surface-muted" />
          </div>
        </div>

        <div className="h-5 w-16 rounded-full bg-surface-muted" />
        <div className="h-3 w-24 rounded bg-surface-muted" />
        <div className="h-3 w-16 rounded bg-surface-muted" />
        <div />
      </div>
    ))}
  </div>
);

const Message = ({ title, text, actionLabel, onAction }) => (
  <div className="border-t border-line-soft px-6 py-14 text-center">
    <p className="text-sm font-semibold text-ink">{title}</p>

    {text && <p className="mt-1 text-sm text-muted-strong">{text}</p>}

    {actionLabel && (
      <button
        type="button"
        onClick={onAction}
        className="mt-5 rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-surface-soft"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

const UsersList = () => {
  const navigate = useNavigate();

  const users = useUserStore((state) => state.users);
  const isLoading = useUserStore((state) => state.isLoading);
  const error = useUserStore((state) => state.error);
  const fetchUsers = useUserStore((state) => state.fetchUsers);

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    return users.filter((user) => {
      if (role !== "all" && user.role?.toLowerCase() !== role) {
        return false;
      }

      if (status === "active" && !user.isActive) {
        return false;
      }

      if (status === "inactive" && user.isActive) {
        return false;
      }

      if (!term) return true;

      return [
        user.fullName,
        user.userName,
        user.email,
        user.phoneNumber,
        user.id,
      ].some(
        (value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(term),
      );
    });
  }, [users, search, role, status]);

  const hasFilters = search.trim() !== "" || role !== "all" || status !== "all";

  const clearFilters = () => {
    setSearch("");
    setRole("all");
    setStatus("all");
  };

  const showSkeleton = isLoading && users.length === 0;
  const showErrorPanel = Boolean(error) && users.length === 0;

  const openUserDetails = (userId) => {
    console.log("Clicked user ID:", userId);

    const targetUrl = `/admin/users/${encodeURIComponent(userId)}`;

    console.log("Navigating to:", targetUrl);

    navigate(targetUrl);
  };

  return (
    <div className="space-y-8">
      {/* Heading */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-medium text-ink">Users</h1>

          <p className="mt-2 text-sm text-muted-strong">
            Manage hospital staff, patient, and caregiver access.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/users/new")}
          className="flex items-center gap-3 rounded-xl bg-primary px-6 py-4 text-sm font-bold text-on-primary shadow-sm transition hover:bg-primary-hover"
        >
          <Plus size={18} />
          Add user
        </button>
      </header>

      {/* Search and filters */}
      <section className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          />

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone or ID…"
            aria-label="Search users"
            className="w-full rounded-xl border border-field bg-white py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-muted focus:border-focus focus:ring-2 focus:ring-focus/25"
          />
        </div>

        <FilterSelect
          label="Filter by role"
          value={role}
          onChange={setRole}
          allLabel="All roles"
          options={ROLE_OPTIONS}
        />

        <FilterSelect
          label="Filter by status"
          value={status}
          onChange={setStatus}
          allLabel="All statuses"
          options={STATUS_OPTIONS}
        />
      </section>

      {/* Error banner */}
      {error && users.length > 0 && (
        <p
          role="alert"
          className="rounded-xl bg-danger-bg px-4 py-3 text-sm text-danger-text"
        >
          {error}
        </p>
      )}

      {/* Users table */}
      <section className="overflow-hidden rounded-2xl border border-line bg-white">
        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            <div
              className={`${GRID} py-4 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-strong`}
            >
              <span>User</span>
              <span>Role</span>
              <span>Phone</span>
              <span>Status</span>
              <span />
            </div>

            {showSkeleton ? (
              <SkeletonRows />
            ) : showErrorPanel ? (
              <Message
                title="Couldn't load users"
                text={error}
                actionLabel="Try again"
                onAction={fetchUsers}
              />
            ) : filteredUsers.length === 0 ? (
              <Message
                title={
                  hasFilters ? "No users match your filters" : "No users yet"
                }
                text={
                  hasFilters
                    ? "Try a different search or clear the filters."
                    : "Users you add will appear here."
                }
                actionLabel={hasFilters ? "Clear filters" : undefined}
                onAction={clearFilters}
              />
            ) : (
              filteredUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => openUserDetails(user.id)}
                  aria-label={`View details for ${user.name}`}
                  className={`${GRID} w-full border-t border-line-soft py-4 text-left transition hover:bg-surface-soft/70 focus-visible:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus`}
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-avatar text-xs font-bold text-on-avatar">
                      {getInitials(user.name)}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">
                        {user.name}
                      </p>

                      {/* The user name too, when another name is shown. */}
                      <p className="truncate text-xs text-muted">
                        {[user.userName !== user.name && user.userName, user.email]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </p>
                    </div>
                  </div>

                  <RoleBadge role={user.role} />

                  <span className="truncate text-sm text-ink-soft">
                    {user.phoneNumber || "—"}
                  </span>

                  <StatusBadge isActive={user.isActive} />

                  <ChevronRight size={18} className="text-muted-strong" />
                </button>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Count */}
      {users.length > 0 && (
        <p className="text-xs text-muted-strong">
          Showing {filteredUsers.length} of {users.length} users
        </p>
      )}
    </div>
  );
};

export default UsersList;
