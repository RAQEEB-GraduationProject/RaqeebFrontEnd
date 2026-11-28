import { useOutletContext, useSearchParams } from "react-router-dom";

import SectionTabs from "../SectionTabs";
import AppointmentsSection from "./AppointmentsSection";

/*
  Patient Care tab, shared by the Admin, Doctor and Nurse patient details
  routes, with two sections (reference screenshot 095741):
    Appointments  GET/POST /Patients/{patientId}/appointments
    Questions     placeholder only: no request is made (waiting for the app)
  The section is kept in the URL (?section=questions), so it survives a
  refresh and the browser's back button.
*/

const SECTION_PARAM = "section";

const SECTIONS = [
  { key: "appointments", label: "Appointments", search: "" },
  { key: "questions", label: "Questions", search: `?${SECTION_PARAM}=questions` },
];

const QuestionsPlaceholder = ({ patientName }) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-4xl font-medium text-ink">Questions</h2>
      <p className="mt-2 text-base text-muted-strong">
        Patient Care · {patientName} clinical record
      </p>
    </div>

    <div className="rounded-2xl border border-line-soft bg-white px-6 py-14 text-center shadow-sm">
      <p className="text-sm font-semibold text-ink">Waiting for application</p>
    </div>
  </div>
);

const PatientCare = () => {
  const { patient } = useOutletContext();
  const [searchParams] = useSearchParams();

  const requested = searchParams.get(SECTION_PARAM);
  const section = SECTIONS.some(({ key }) => key === requested) ? requested : "appointments";

  return (
    <div className="space-y-6">
      <SectionTabs label="Patient care sections" sections={SECTIONS} active={section} />

      {section === "appointments" && <AppointmentsSection patientName={patient.name} />}
      {section === "questions" && <QuestionsPlaceholder patientName={patient.name} />}
    </div>
  );
};

export default PatientCare;
