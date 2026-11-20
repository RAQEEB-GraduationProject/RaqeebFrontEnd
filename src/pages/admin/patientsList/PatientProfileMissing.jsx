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
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-base font-bold text-teal-800">
            {getInitials(user.userName)}
          </div>

          <h1 className="mt-5 text-3xl font-medium text-[#0b2a3d]">
            {user.userName}
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm text-slate-500">
            Patient has no medical profile yet. Please complete patient account.
          </p>

          <button
            type="button"
            onClick={() => navigate(completePatientPath(userId))}
            className="mt-8 rounded-xl bg-[#0f3d4c] px-6 py-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#0b3240]"
          >
            Complete Patient Account
          </button>
        </div>
      )}
    </PatientUserGate>
  );
};

export default PatientProfileMissing;
