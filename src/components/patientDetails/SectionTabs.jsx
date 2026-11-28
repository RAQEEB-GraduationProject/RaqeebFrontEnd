import { Link } from "react-router-dom";

// Side-by-side navigation between the sections of one patient tab.
// `sections`: [{ key, label, search }] where `search` is the section's query
// string ("" for the default one); `active` is the shown section's key.
const SectionTabs = ({ label, sections, active }) => (
  <nav aria-label={label} className="flex flex-wrap gap-3">
    {sections.map(({ key, label: text, search }) => {
      const isActive = key === active;
      return (
        <Link
          key={key}
          to={{ search }}
          aria-current={isActive ? "page" : undefined}
          className={`rounded-xl border px-4 py-2.5 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-focus/60 ${
            isActive
              ? "border-accent/30 bg-accent-soft text-accent"
              : "border-line bg-white text-ink-soft hover:text-ink"
          }`}
        >
          {text}
        </Link>
      );
    })}
  </nav>
);

export default SectionTabs;
