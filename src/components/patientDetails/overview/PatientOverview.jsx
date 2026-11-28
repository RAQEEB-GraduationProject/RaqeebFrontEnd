import { Link, useOutletContext, useSearchParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import SectionTabs from "../SectionTabs";
import { formatHistoryDate } from "../../patients/medicalHistory/medicalHistoryForm";
import MedicalHistorySection from "./MedicalHistorySection";

/*
  Patient Overview tab, shared by the Admin, Doctor and Nurse patient details
  routes, with two sections (reference screenshots 095520 / 095535):
    Summary          GET /Patients/{patientId}/overview. Not fetched here: the
                     details shell (DoctorPatientDetails) loads it once and
                     passes it through the outlet context.
    Medical History  GET /Patients/{patientId}/medical-history (own section).
  The section is kept in the URL (?section=medical-history), so it survives a
  refresh and the browser's back button. Only what the API returns is shown;
  an empty field reads "Not recorded" instead of a made-up value.
*/

const SECTION_PARAM = "section";
const MEDICAL_HISTORY = "medical-history";

const SECTIONS = [
  { key: "summary", label: "Summary", search: "" },
  { key: MEDICAL_HISTORY, label: "Medical History", search: `?${SECTION_PARAM}=${MEDICAL_HISTORY}` },
];

const Card = ({ title, subtitle, action, className = "", children }) => (
  <section
    className={`rounded-2xl border border-line-soft bg-white p-6 shadow-sm ${className}`}
  >
    <div className="flex items-start justify-between gap-4">
      <h2 className="text-lg font-medium text-ink">{title}</h2>
      {action}
    </div>
    {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
    <dl className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">{children}</dl>
  </section>
);

const Field = ({ label, value, children }) => (
  <div className="min-w-0">
    <dt className="text-xs text-muted">{label}</dt>
    <dd className="mt-1 break-words text-sm font-medium text-ink">
      {value == null ? (
        <span className="font-normal text-muted">Not recorded</span>
      ) : (
        (children ?? value)
      )}
    </dd>
  </div>
);

// "Cycle 4 of 6 · Day 8", using only the parts the backend provided.
const formatCycle = ({ currentCycle, totalCycles, currentDay }) => {
  if (currentCycle == null) return null;

  return [
    totalCycles != null
      ? `Cycle ${currentCycle} of ${totalCycles}`
      : `Cycle ${currentCycle}`,
    currentDay != null && `Day ${currentDay}`,
  ]
    .filter(Boolean)
    .join(" · ");
};

// treatmentProgress is null until the backend has a treatment module, so its
// two fields read "Not recorded".
const Summary = ({ overview }) => {
  const { patient, careTeam, treatmentProgress } = overview;
  const treatmentStatus = treatmentProgress?.treatmentStatus ?? null;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-3">
      <Card
        title="Clinical overview"
        subtitle="Current diagnosis and treatment status"
        className="lg:col-span-2"
      >
        <Field label="Cancer type" value={patient.diagnosis} />
        <Field label="Stage" value={patient.stage} />
        <Field label="Treating doctor" value={careTeam.treatingDoctor?.name} />
        <Field label="Nurse" value={careTeam.nurse?.name} />
        <Field label="Treatment" value={patient.treatment} />
        <Field label="Protocol" value={patient.protocol} />
        <Field label="Treatment status" value={treatmentStatus}>
          <span className="inline-flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full bg-success"
              aria-hidden="true"
            />
            {treatmentStatus}
          </span>
        </Field>
        <Field label="Current cycle" value={formatCycle(treatmentProgress ?? {})} />
      </Card>

      <Card
        title="Personal info"
        action={
          <Link
            to={{ search: SECTIONS[1].search }}
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
          >
            Medical history
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        }
      >
        <Field label="Phone" value={patient.phoneNumber} />
        <Field label="Primary caregiver" value={careTeam.primaryCaregiver?.name} />
        <Field
          label="Date of birth"
          value={formatHistoryDate(patient.dateOfBirth?.slice(0, 10))}
        />
      </Card>
    </div>
  );
};

const PatientOverview = () => {
  const { overview, patient } = useOutletContext();
  const [searchParams] = useSearchParams();

  const section =
    searchParams.get(SECTION_PARAM) === MEDICAL_HISTORY ? MEDICAL_HISTORY : "summary";

  return (
    <div className="space-y-6">
      <SectionTabs label="Patient overview sections" sections={SECTIONS} active={section} />

      {section === MEDICAL_HISTORY ? (
        <MedicalHistorySection patientName={patient.name} />
      ) : (
        <Summary overview={overview} />
      )}
    </div>
  );
};

export default PatientOverview;
