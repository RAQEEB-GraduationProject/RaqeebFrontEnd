import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, Filter, Search } from "lucide-react";

import { STAFF_ROLES } from "../../../../data/mockStaff";
import getInitials from "../../../../components/patients/getInitials";

const TABS = [...STAFF_ROLES, { value: "unassigned", label: "Unassigned" }];

const StaffFilter = ({
  staff,
  patientCountByStaff,
  unassignedCount,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState("doctor");
  const [query, setQuery] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const onClick = (e) => {
      if (!wrapperRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const members = useMemo(() => {
    const term = query.trim().toLowerCase();

    return staff
      .filter((member) => member.role === role)
      .filter((member) => member.name.toLowerCase().includes(term));
  }, [staff, role, query]);

  const selectTab = (next) => {
    setRole(next);
    setQuery("");

    if (next === "unassigned") {
      onChange({ role: "unassigned" });
      setOpen(false);
    }
  };

  const selectStaff = (member) => {
    onChange({ role: member.role, staffId: member.id });
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 sm:w-[190px]"
      >
        <span className="flex items-center gap-2">
          <Filter size={16} />
          Filter by staff
        </span>

        <ChevronRight size={16} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-3 w-[min(400px,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
          <h3 className="text-base font-semibold text-[#0b2a3d]">
            Filter patients by care staff
          </h3>

          <div className="mt-4 grid grid-cols-4 gap-1 rounded-xl bg-slate-100 p-1">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => selectTab(tab.value)}
                className={`rounded-lg px-2 py-2 text-sm font-semibold transition ${
                  role === tab.value
                    ? "bg-white text-teal-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {role === "unassigned" ? (
            <p className="px-1 py-6 text-center text-sm text-slate-500">
              {unassignedCount} patients without a care team
            </p>
          ) : (
            <>
              <div className="relative mt-4">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search staff by name…"
                  aria-label="Search staff"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-[15px] outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                />
              </div>

              <ul className="mt-3 max-h-64 overflow-y-auto">
                {members.length === 0 ? (
                  <li className="px-3 py-6 text-center text-sm text-slate-400">
                    No staff found
                  </li>
                ) : (
                  members.map((member) => (
                    <li key={member.id} className="border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => selectStaff(member)}
                        className="flex w-full items-center gap-3 px-1 py-3 text-left transition hover:bg-slate-50"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-xs font-bold text-teal-800">
                          {getInitials(member.name)}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[15px] font-semibold text-[#0b2a3d]">
                            {member.name}
                          </span>
                          <span className="block truncate text-xs text-slate-500">
                            {member.detail}
                          </span>
                        </span>

                        <span className="text-sm text-slate-500">
                          {patientCountByStaff[member.id] ?? 0}
                        </span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default StaffFilter;
