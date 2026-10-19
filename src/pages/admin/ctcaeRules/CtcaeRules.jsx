import { useMemo, useState } from "react";
import { ChevronDown, Pencil, Plus, Search, Trash2 } from "lucide-react";
import Swal from "sweetalert2";

import { ctcaeRules as initialRules } from "../../../data/ctcaeRules";
import RuleFormDrawer from "./components/RuleFormDrawer";
import RuleDetailsDrawer from "./components/RuleDetailsDrawer";
import { CategoryBadge, HomeBadge, PediatricBadge } from "./components/badges";

const TABS = [
  { value: "all", label: "All rules" },
  { value: "Pediatric-specific", label: "Pediatric-specific" },
  { value: "Same as Adult", label: "Same as adult" },
];

const HOME_OPTIONS = ["Yes", "Partial", "No"].map((value) => ({
  value,
  label: value,
}));

const PAGE_SIZE = 25;

const GRID =
  "grid grid-cols-[minmax(200px,2fr)_minmax(180px,1.6fr)_minmax(150px,1.2fr)_minmax(110px,0.8fr)_minmax(140px,1fr)_96px] items-center gap-4 px-6";

const GRADES = ["grade1", "grade2", "grade3", "grade4", "grade5"];

// "N/A" and "-" in the source mean the grade is not defined for that event.
const isDefined = (text) =>
  !["n/a", "-", ""].includes(text.trim().toLowerCase());

const FilterSelect = ({ label, value, onChange, allLabel, options }) => (
  <div className="relative w-full sm:w-[190px]">
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-4 pr-10 text-sm text-slate-600 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
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
      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
    />
  </div>
);

const GradeChips = ({ rule }) => (
  <div className="flex gap-1" aria-label="Defined grades">
    {GRADES.map((grade, index) => (
      <span
        key={grade}
        title={`Grade ${index + 1}: ${rule[grade]}`}
        className={`flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold ${
          isDefined(rule[grade])
            ? "bg-teal-50 text-teal-900"
            : "bg-slate-100 text-slate-300"
        }`}
      >
        {index + 1}
      </span>
    ))}
  </div>
);

const Message = ({ title, text, actionLabel, onAction }) => (
  <div className="border-t border-slate-100 px-6 py-14 text-center">
    <p className="text-sm font-semibold text-[#0b2a3d]">{title}</p>

    {text && <p className="mt-1 text-sm text-slate-500">{text}</p>}

    {actionLabel && (
      <button
        type="button"
        onClick={onAction}
        className="mt-5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-[#0f3d4c] transition hover:bg-slate-50"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

const notify = (title) =>
  Swal.fire({
    toast: true,
    position: "top-end",
    icon: "success",
    title,
    showConfirmButton: false,
    timer: 2500,
  });

// Changes live in React state only: they are lost on page reload.
const CtcaeRules = () => {
  const [rules, setRules] = useState(initialRules);

  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
  const [category, setCategory] = useState("all");
  const [home, setHome] = useState("all");
  const [visible, setVisible] = useState(PAGE_SIZE);

  // { rule: null } = add form, { rule } = edit form
  const [form, setForm] = useState(null);
  const [details, setDetails] = useState(null);

  const categories = useMemo(
    () => [...new Set(rules.map((rule) => rule.category))].sort(),
    [rules],
  );

  const filteredRules = useMemo(() => {
    const term = search.trim().toLowerCase();

    return rules.filter((rule) => {
      if (tab !== "all" && rule.pediatricCriteria !== tab) return false;
      if (category !== "all" && rule.category !== category) return false;
      if (home !== "all" && rule.homeMonitoring !== home) return false;

      if (!term) return true;

      return [
        rule.adverseEvent,
        rule.category,
        rule.grade1,
        rule.grade2,
        rule.grade3,
        rule.grade4,
        rule.grade5,
        rule.notes,
        rule.pediatricNotes,
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(term),
      );
    });
  }, [rules, search, tab, category, home]);

  const hasFilters =
    search.trim() !== "" ||
    category !== "all" ||
    home !== "all" ||
    tab !== "all";

  // Changing a filter also resets how many rows are revealed.
  const withReset = (setter) => (value) => {
    setter(value);
    setVisible(PAGE_SIZE);
  };

  const clearFilters = () => {
    setSearch("");
    setTab("all");
    setCategory("all");
    setHome("all");
    setVisible(PAGE_SIZE);
  };

  const handleSave = (values, editingRule) => {
    if (editingRule) {
      setRules((current) =>
        current.map((rule) =>
          rule.id === editingRule.id
            ? { ...rule, ...values, id: rule.id }
            : rule,
        ),
      );
      notify(`${values.adverseEvent} updated`);
    } else {
      setRules((current) => [
        { ...values, id: `ctcae-${crypto.randomUUID()}` },
        ...current,
      ]);
      notify(`${values.adverseEvent} added`);
    }

    setForm(null);
  };

  const handleDelete = async (rule) => {
    const { isConfirmed } = await Swal.fire({
      title: "Delete this rule?",
      text: `"${rule.adverseEvent}" (${rule.category}) will be removed from the list.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#e11d48",
      cancelButtonText: "Cancel",
    });

    if (!isConfirmed) return;

    setRules((current) => current.filter((item) => item.id !== rule.id));
    setDetails((current) => (current?.id === rule.id ? null : current));
    notify(`${rule.adverseEvent} deleted`);
  };

  const shownRules = filteredRules.slice(0, visible);

  return (
    <div className="space-y-8">
      {/* Heading */}
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-medium text-[#0b2a3d]">CTCAE rules</h1>

          <p className="mt-2 text-sm text-slate-500">
            Configure grading thresholds used by the hospital monitoring engine.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setForm({ rule: null })}
          className="flex items-center gap-3 rounded-xl bg-[#0f3d4c] px-6 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#0b3240]"
        >
          <Plus size={18} />
          Add rule
        </button>
      </header>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-slate-200" role="tablist">
        {TABS.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={tab === item.value}
            onClick={() => withReset(setTab)(item.value)}
            className={`-mb-px border-b-2 px-1 pb-3 text-xs font-semibold transition ${
              tab === item.value
                ? "border-teal-700 text-teal-800"
                : "border-transparent text-slate-500 hover:text-[#0b2a3d]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Search and filters */}
      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={search}
            onChange={(e) => withReset(setSearch)(e.target.value)}
            placeholder="Search by adverse event, category, grade or notes…"
            aria-label="Search CTCAE rules"
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
          />
        </div>

        <FilterSelect
          label="Filter by category"
          value={category}
          onChange={withReset(setCategory)}
          allLabel="All categories"
          options={categories.map((value) => ({ value, label: value }))}
        />

        <FilterSelect
          label="Filter by home monitoring"
          value={home}
          onChange={withReset(setHome)}
          allLabel="Home monitoring"
          options={HOME_OPTIONS}
        />
      </section>

      {/* Rules table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <div className="min-w-[960px]">
            <div
              className={`${GRID} py-4 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500`}
            >
              <span>Adverse event</span>
              <span>Category</span>
              <span>Grades</span>
              <span>Home monitoring</span>
              <span>Pediatric criteria</span>
              <span />
            </div>

            {filteredRules.length === 0 ? (
              <Message
                title={
                  hasFilters ? "No rules match your filters" : "No rules yet"
                }
                text={
                  hasFilters
                    ? "Try a different search or clear the filters."
                    : "Rules you add will appear here."
                }
                actionLabel={hasFilters ? "Clear filters" : undefined}
                onAction={clearFilters}
              />
            ) : (
              shownRules.map((rule) => (
                <div
                  key={rule.id}
                  className={`${GRID} border-t border-slate-100 py-4 transition hover:bg-slate-50/70`}
                >
                  <button
                    type="button"
                    onClick={() => setDetails(rule)}
                    aria-label={`View grading criteria for ${rule.adverseEvent}`}
                    className="min-w-0 rounded text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600"
                  >
                    <p className="truncate text-sm font-semibold text-[#0b2a3d]">
                      {rule.adverseEvent}
                    </p>

                    <p className="text-xs text-slate-400">
                      View grading criteria
                    </p>
                  </button>

                  <CategoryBadge value={rule.category} />

                  <GradeChips rule={rule} />

                  <HomeBadge value={rule.homeMonitoring} />

                  <PediatricBadge value={rule.pediatricCriteria} />

                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => setForm({ rule })}
                      aria-label={`Edit ${rule.adverseEvent}`}
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-[#0b2a3d]"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(rule)}
                      aria-label={`Delete ${rule.adverseEvent}`}
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Count */}
      {rules.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Showing {shownRules.length} of {filteredRules.length} matching rules
            ({rules.length} total)
          </p>

          {filteredRules.length > visible && (
            <button
              type="button"
              onClick={() => setVisible((count) => count + PAGE_SIZE)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-[#0f3d4c] transition hover:bg-slate-50"
            >
              Show more
            </button>
          )}
        </div>
      )}

      {details && (
        <RuleDetailsDrawer
          key={details.id}
          rule={rules.find((rule) => rule.id === details.id) ?? details}
          onEdit={(rule) => {
            setDetails(null);
            setForm({ rule });
          }}
          onClose={() => setDetails(null)}
        />
      )}

      {form && (
        <RuleFormDrawer
          key={form.rule?.id ?? "new"}
          rule={form.rule}
          rules={rules}
          categories={categories}
          onSave={(values) => handleSave(values, form.rule)}
          onClose={() => setForm(null)}
        />
      )}
    </div>
  );
};

export default CtcaeRules;
