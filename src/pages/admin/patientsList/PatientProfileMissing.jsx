import { useNavigate, useParams } from "react-router-dom";

import getInitials from "../../../components/patients/getInitials";
import PatientUserGate from "./components/PatientUserGate";
import { completePatientPath } from "./patientPaths";

// View on a Patient user that has no medical profile yet: explains it and
// leads to the form (which is a separate page).
const PatientProfileMissing = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  return (
    <PatientUserGate userId={userId}>
      {(user) => (
        <div className="rounded-3xl border border-line bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-avatar text-base font-bold text-on-avatar">
            {getInitials(user.name)}
          </div>

          <h1 className="mt-5 text-3xl font-medium text-ink">
            {user.name}
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm text-muted-strong">
            Patient has no medical profile yet. Please complete patient account.
          </p>

          <button
            type="button"
            onClick={() => navigate(completePatientPath(userId))}
            className="mt-8 rounded-xl bg-primary px-6 py-4 text-xs font-bold text-on-primary shadow-sm transition hover:bg-primary-hover"
          >
            Complete Patient Account
          </button>
        </div>
      )}
    </PatientUserGate>
  );
};

export default PatientProfileMissing;
