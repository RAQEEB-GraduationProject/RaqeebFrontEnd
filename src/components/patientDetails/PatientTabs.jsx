import { NavLink } from "react-router-dom";

// `tabs`: [{ label, to }] where `to` is relative to the patient's route.
const PatientTabs = ({ tabs }) => (
  <nav
    aria-label="Patient sections"
    className="-mx-6 overflow-x-auto border-b border-line px-6 lg:-mx-12 lg:px-12"
  >
    <ul className="flex min-w-max gap-8">
      {tabs.map(({ label, to }) => (
        <li key={to}>
          <NavLink
            to={to}
            className={({ isActive }) =>
              `-mb-px block border-b-2 pb-4 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-focus/60 ${
                isActive
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-strong hover:text-ink"
              }`
            }
          >
            {label}
          </NavLink>
        </li>
      ))}
    </ul>
  </nav>
);

export default PatientTabs;
