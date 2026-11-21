import { useOutletContext } from "react-router-dom";

/*
  Patient Overview tab, shared by the Admin, Doctor and Nurse patient details
  routes. It does not fetch: the details shell (DoctorPatientDetails) loads
  GET /Patients/{patientId}/overview once, shows loading / error itself, and
  passes the result down through the outlet context (see PatientDetailsLayout).
  Only what the API returns is shown; a field the backend left empty reads
  "Not recorded" instead of a made-up value.
*/

const Card = ({ title, subtitle, className = "", children }) => (
  <section
    className={`rounded-2xl border border-slate-100 bg-white p-6 shadow-sm ${className}`}
  >
    <h2 className="text-lg font-medium text-slate-900">{title}</h2>
    {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
    <dl className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">{children}</dl>
  </section>
);

const Field = ({ label, value, children }) => (
  <div className="min-w-0">
    <dt className="text-xs text-slate-400">{label}</dt>
    <dd className="mt-1 break-words text-sm font-medium text-slate-800">
      {value == null ? (
        <span className="font-normal text-slate-400">Not recorded</span>
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

const PatientOverview = () => {
  const { overview } = useOutletContext();
  const { clinical, personal } = overview;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-3">
      <Card
        title="Clinical overview"
        subtitle="Current diagnosis and treatment status"
        className="lg:col-span-2"
      >
        <Field label="Cancer type" value={clinical.cancerType} />
        <Field label="Stage" value={clinical.stage} />
        <Field label="Treating doctor" value={clinical.treatingDoctor} />
        <Field label="Treatment status" value={clinical.treatmentStatus}>
          <span className="inline-flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full bg-emerald-500"
              aria-hidden="true"
            />
            {clinical.treatmentStatus}
          </span>
        </Field>
        <Field label="Protocol" value={clinical.protocol} />
        <Field label="Current cycle" value={formatCycle(clinical)} />
      </Card>

      <Card title="Personal info">
        <Field label="Phone" value={personal.phone} />
        <Field label="Primary caregiver" value={personal.primaryCaregiver} />
      </Card>
    </div>
  );
};

export default PatientOverview;
