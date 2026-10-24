import RiskBadge from "../patients/RiskBadge";
import { RISK_AVATAR_STYLES } from "../patients/riskStyles";
import getInitials from "../patients/getInitials";

// Only fields the patient actually has are shown; nothing is invented.
const buildSubline = ({ medicalRecordNumber, age, gender, bloodGroup }) =>
  [
    medicalRecordNumber,
    age != null && `${age} years`,
    gender,
    bloodGroup && `Blood group ${bloodGroup}`,
  ]
    .filter(Boolean)
    .join(" · ");

const PatientDetailsHeader = ({ patient, actions }) => (
  <div className="flex flex-wrap items-center justify-between gap-5">
    <div className="flex min-w-0 items-center gap-5">
      <div
        className={`flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-2xl text-lg font-semibold ${
          RISK_AVATAR_STYLES[patient.risk] ?? "bg-slate-100 text-slate-600"
        }`}
      >
        {getInitials(patient.name)}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="truncate text-3xl font-medium text-slate-900">
            {patient.name}
          </h1>
          {patient.risk && (
            <RiskBadge risk={patient.risk} label={`${patient.risk} risk`} />
          )}
        </div>
        <p className="mt-1 text-sm text-slate-500">{buildSubline(patient)}</p>
      </div>
    </div>

    {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
  </div>
);

export default PatientDetailsHeader;
