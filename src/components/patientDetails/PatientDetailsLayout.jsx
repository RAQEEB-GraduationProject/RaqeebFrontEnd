import { Link, Outlet } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import PatientDetailsHeader from "./PatientDetailsHeader";
import PatientTabs from "./PatientTabs";

// Role-agnostic shell: breadcrumb, patient header, tabs and the active tab's
// page (<Outlet />). Each role supplies its own `tabs`, `actions` and list link.
const PatientDetailsLayout = ({
  patient,
  tabs,
  actions,
  listPath,
  listLabel = "Patients",
}) => (
  <div className="space-y-6">
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs">
      <Link to={listPath} className="text-[#3f5ea8] hover:underline">
        {listLabel}
      </Link>
      <ChevronRight size={12} className="text-slate-400" aria-hidden="true" />
      <span className="text-slate-500">{patient.name}</span>
    </nav>

    <PatientDetailsHeader patient={patient} actions={actions} />
    <PatientTabs tabs={tabs} />

    <Outlet context={{ patient }} />
  </div>
);

export default PatientDetailsLayout;
