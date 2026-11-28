import { Link, Navigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

import usePatientUser from "../hooks/usePatientUser";
import { PATIENTS_PATH, patientUserPath } from "../patientPaths";

const Panel = ({ title, text, children }) => (
  <div className="rounded-2xl border border-line-soft bg-white px-6 py-14 text-center shadow-sm">
    <p className="text-sm font-semibold text-ink">{title}</p>

    {text && <p className="mt-1 text-sm text-muted-strong">{text}</p>}

    {children}
  </div>
);

const BackLink = () => (
  <Link
    to={PATIENTS_PATH}
    className="mt-4 inline-block text-sm font-semibold text-accent hover:underline"
  >
    Back to patients
  </Link>
);

/*
  Shared frame of the two "no medical profile yet" pages. It loads the user,
  shows the breadcrumb, and only renders `children(user)` for a user that
  really has no profile:
    user has a profile  -> redirected to the patient details page
    inactive profile    -> notice only (nothing to complete)
    unknown user / load failure / loading -> the matching message
  `current` is the last breadcrumb label; when set, the user's name links back
  to the empty-state page.
*/
const PatientUserGate = ({ userId, current, children }) => {
  const { user, record, profileStatus, isLoading, error, retry } = usePatientUser(userId);

  if (isLoading) {
    return (
      <div
        aria-busy="true"
        className="rounded-2xl border border-line-soft bg-white px-6 py-14 text-center text-sm text-muted-strong shadow-sm"
      >
        Loading patient…
      </div>
    );
  }

  if (error) {
    return (
      <Panel title="Couldn't load patient" text={error}>
        <button
          type="button"
          onClick={retry}
          className="mt-4 rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:bg-surface-soft"
        >
          Try again
        </button>
      </Panel>
    );
  }

  if (!user) {
    return (
      <Panel title="Patient not found">
        <BackLink />
      </Panel>
    );
  }

  if (profileStatus === "active") {
    return <Navigate to={`${PATIENTS_PATH}/${record.id}`} replace />;
  }

  return (
    <div className="mx-auto max-w-[1160px] space-y-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs">
        <Link to={PATIENTS_PATH} className="text-accent hover:underline">
          Patients
        </Link>
        <ChevronRight size={12} className="text-muted" aria-hidden="true" />

        {current ? (
          <>
            <Link to={patientUserPath(userId)} className="text-accent hover:underline">
              {user.name}
            </Link>
            <ChevronRight size={12} className="text-muted" aria-hidden="true" />
            <span className="text-muted-strong">{current}</span>
          </>
        ) : (
          <span className="text-muted-strong">{user.name}</span>
        )}
      </nav>

      {profileStatus === "inactive" ? (
        <Panel
          title="This patient's medical profile is inactive."
          text="There is nothing to complete."
        >
          <BackLink />
        </Panel>
      ) : (
        children(user)
      )}
    </div>
  );
};

export default PatientUserGate;
