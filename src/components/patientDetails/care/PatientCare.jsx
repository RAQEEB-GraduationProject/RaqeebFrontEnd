import { Link, useOutletContext, useSearchParams } from "react-router-dom";

import AppointmentsSection from "./AppointmentsSection";
import JournalSection from "./JournalSection";

/*
  Patient Care tab, shared by the Admin, Doctor and Nurse patient details
  routes, with three sections (reference screenshots 095728 / 095741):
    Journal       GET/POST /Patients/{patientId}/journal
    Appointments  GET/POST /Patients/{patientId}/appointments
    Questions     placeholder only: no request is made (waiting for the app)
  The section is kept in the URL (?section=appointments), so it survives a
  refresh and the browser's back button.
*/

const SECTION_PARAM = "section";

const SECTIONS = [
  { key: "journal", label: "Journal", search: "" },
  { key: "appointments", label: "Appointments", search: `?${SECTION_PARAM}=appointments` },
  { key: "questions", label: "Questions", search: `?${SECTION_PARAM}=questions` },
];

const SectionTabs = ({ active }) => (
  <nav aria-label="Patient care sections" className="flex flex-wrap gap-3">
    {SECTIONS.map(({ key, label, search }) => {
      const isActive = key === active;
      return (
        <Link
          key={key}
          to={{ search }}
          aria-current={isActive ? "page" : undefined}
          className={`rounded-xl border px-4 py-2.5 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3f5ea8]/40 ${
            isActive
              ? "border-[#3f5ea8]/30 bg-[#eef3fc] text-[#3f5ea8]"
              : "border-slate-200 bg-white text-slate-600 hover:text-slate-900"
          }`}
        >
          {label}
        </Link>
      );
    })}
  </nav>
);

const QuestionsPlaceholder = ({ patientName }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-4xl font-medium text-slate-900">Questions</h2>
      <p className="mt-2 text-base text-slate-500">
        Patient Care · {patientName} clinical record
      </p>
    </div>

    <div className="rounded-2xl border border-slate-100 bg-white px-6 py-14 text-center shadow-sm">
      <p className="text-sm font-semibold text-slate-800">Waiting for application</p>
    </div>
  </div>
);

const PatientCare = () => {
  const { patient } = useOutletContext();
  const [searchParams] = useSearchParams();

  const requested = searchParams.get(SECTION_PARAM);
  const section = SECTIONS.some(({ key }) => key === requested) ? requested : "journal";

  return (
    <div className="space-y-6">
      <SectionTabs active={section} />

      {section === "appointments" && <AppointmentsSection patientName={patient.name} />}
      {section === "questions" && <QuestionsPlaceholder patientName={patient.name} />}
      {section === "journal" && <JournalSection patientName={patient.name} />}
    </div>
  );
};

export default PatientCare;
