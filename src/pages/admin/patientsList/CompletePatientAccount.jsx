import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LoaderCircle } from "lucide-react";

import PatientProfileFields from "../../../components/patients/PatientProfileFields";
import MedicalHistoryStep from "../../../components/patients/medicalHistory/MedicalHistoryStep";
import {
  INITIAL_PROFILE_VALUES,
  toProfilePayload,
  validateProfile,
} from "../../../components/patients/patientProfileForm";
import { usePatientStore } from "../../../store/patientStore";
import { toFormErrors } from "../../../utils/formErrors";
import PatientUserGate from "./components/PatientUserGate";
import notify from "./notify";
import { PATIENTS_PATH, patientUserPath } from "./patientPaths";

/*
  The medical profile form for a Patient user without one. The user id comes
  from the URL (the selected user), never from the form. Saving sends
  POST /Patients; on failure the entered values stay so the admin can retry.
*/
// The table reloads its data when it opens and shows the completed profile.
const finishCompletion = (navigate, name) => {
  notify("success", `${name}'s patient account was completed`);
  navigate(PATIENTS_PATH);
};

const CompletePatientForm = ({ user, onCreated }) => {
  const navigate = useNavigate();

  const createPatientProfile = usePatientStore((state) => state.createPatientProfile);
  const isSaving = usePatientStore((state) => state.isCreatingProfile);
  const clearError = usePatientStore((state) => state.clearCreateProfileError);

  const [values, setValues] = useState(INITIAL_PROFILE_VALUES);
  const [errors, setErrors] = useState({});
  // The general message of a failed save (field messages go under the fields).
  const [formError, setFormError] = useState(null);

  // Start and leave without a stale error from an earlier attempt.
  useEffect(() => {
    clearError();
    return clearError;
  }, [clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setValues((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSaving) return;

    clearError();
    setFormError(null);

    const nextErrors = validateProfile(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    const created = await createPatientProfile(toProfilePayload(user.id, values));

    if (created?.id) {
      // Optional medical history step for the new patientId.
      onCreated({ patientId: created.id, name: user.name });
    } else if (created) {
      finishCompletion(navigate, user.name);
    } else if (usePatientStore.getState().inactiveProfileUserIds.includes(user.id)) {
      // The user already has a profile (inactive): nothing to complete.
      notify("info", `${user.name} already has a patient profile, which is inactive`);
      navigate(PATIENTS_PATH);
    } else {
      // Keep the entries and show the backend's errors (USER_INACTIVE ...).
      const failure = usePatientStore.getState().createProfileError;
      if (!failure) return;

      const result = toFormErrors(failure, Object.keys(INITIAL_PROFILE_VALUES));
      setErrors(result.fieldErrors);
      setFormError(result.formError);
    }
  };

  return (
    <>
      <div>
        <h1 className="text-4xl font-medium text-ink">
          Complete patient account
        </h1>

        <p className="mt-3 text-sm text-muted-strong">
          Enter the medical information for <strong>{user.name}</strong>.
        </p>
      </div>

      {formError && (
        <p
          role="alert"
          className="rounded-xl bg-danger-bg px-4 py-3 text-sm text-danger-text"
        >
          {formError}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-7"
      >
        <h2 className="text-base font-medium text-ink">
          Patient medical profile
        </h2>

        <p className="mt-1 text-xs text-muted">
          Date of birth and gender are required.
        </p>

        <div className="mt-6">
          <PatientProfileFields
            values={values}
            errors={errors}
            onChange={handleChange}
            disabled={isSaving}
          />
        </div>

        <div className="mt-8 flex justify-end gap-3 border-t border-line pt-6">
          <button
            type="button"
            onClick={() => navigate(patientUserPath(user.id))}
            disabled={isSaving}
            className="rounded-xl border border-line bg-white px-6 py-4 text-xs font-bold text-ink transition hover:bg-surface-soft disabled:cursor-not-allowed disabled:border-disabled disabled:text-disabled-text disabled:hover:bg-white"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-4 text-xs font-bold text-on-primary shadow-sm transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-disabled disabled:text-on-disabled disabled:shadow-none"
          >
            {isSaving && <LoaderCircle size={14} className="animate-spin" />}
            {isSaving ? "Saving..." : "Save patient profile"}
          </button>
        </div>
      </form>
    </>
  );
};

const CompletePatientAccount = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  // { patientId, name } once POST /Patients succeeded. Kept here, above
  // the gate: the gate redirects users that have an active profile, which is
  // exactly what this user becomes after saving.
  const [created, setCreated] = useState(null);

  if (created) {
    return (
      <div className="mx-auto max-w-[1160px] space-y-6">
        <h1 className="text-4xl font-medium text-ink">
          Complete patient account
        </h1>

        <MedicalHistoryStep
          patientId={created.patientId}
          patientName={created.name}
          onDone={() => finishCompletion(navigate, created.name)}
        />
      </div>
    );
  }

  return (
    <PatientUserGate userId={userId} current="Complete account">
      {(user) => <CompletePatientForm user={user} onCreated={setCreated} />}
    </PatientUserGate>
  );
};

export default CompletePatientAccount;
