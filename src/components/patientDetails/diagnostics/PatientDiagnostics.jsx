import { useOutletContext, useParams, useSearchParams } from "react-router-dom";

import SectionTabs from "../SectionTabs";
import ImagingSection from "./ImagingSection";
import LabResultsSection from "./LabResultsSection";

/*
  Diagnostics tab, shared by the Admin, Doctor and Nurse patient details routes,
  with two sections (reference screenshots 095641 / 095658):
    Lab Results  GET /Patients/{patientId}/diagnostics/labs
    Imaging      GET /Patients/{patientId}/diagnostics/imaging
  Each is requested the first time it is shown. The section is kept in the URL
  (?section=imaging), so it survives a refresh and the browser's back button.
  Read-only: the backend has no upload / edit / delete, so the reference's
  "Add entry", "Export" and "Open care plan" are not shown.
*/

const SECTION_PARAM = "section";
const IMAGING = "imaging";

const SECTIONS = [
  { key: "lab-results", label: "Lab Results", search: "" },
  { key: IMAGING, label: "Imaging", search: `?${SECTION_PARAM}=${IMAGING}` },
];

const PatientDiagnostics = () => {
  const { patientId } = useParams();
  const { patient } = useOutletContext();
  const [searchParams] = useSearchParams();

  const section = searchParams.get(SECTION_PARAM) === IMAGING ? IMAGING : "lab-results";
  const Section = section === IMAGING ? ImagingSection : LabResultsSection;

  return (
    <div className="space-y-6">
      <SectionTabs label="Diagnostics sections" sections={SECTIONS} active={section} />

      {/* Keyed: another patient starts with empty filters and no open report. */}
      <Section key={patientId} patientId={patientId} patientName={patient.name} />
    </div>
  );
};

export default PatientDiagnostics;
