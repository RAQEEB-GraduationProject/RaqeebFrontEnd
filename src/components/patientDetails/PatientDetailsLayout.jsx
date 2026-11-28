import { Link, Outlet } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import PatientDetailsHeader from "./PatientDetailsHeader";
import PatientTabs from "./PatientTabs";

// Role-agnostic shell: breadcrumb, patient header, tabs and the active tab's
// page (<Outlet />). Each role supplies its own `tabs`, `actions` and list link.
// `patient` is overview.patient; `overview` (patient, careTeam,
// treatmentProgress) is handed to the tabs through the outlet context so they
// don't refetch it.
const PatientDetailsLayout = ({
  patient,
  overview,
  tabs,
  actions,
  listPath,
  listLabel = "Patients",
}) => (
  <div className="space-y-6">
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs">
      <Link to={listPath} className="text-accent hover:underline">
        {listLabel}
      </Link>
      <ChevronRight size={12} className="text-muted" aria-hidden="true" />
      <span className="text-muted-strong">{patient.name}</span>
    </nav>

    <PatientDetailsHeader patient={patient} actions={actions} />
    <PatientTabs tabs={tabs} />

    <Outlet context={{ patient, overview }} />
  </div>
);

export default PatientDetailsLayout;
