import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LoaderCircle } from "lucide-react";

import PatientProfileFields from "../../../components/patients/PatientProfileFields";
import {
  INITIAL_PROFILE_VALUES,
  toProfilePayload,
  validateProfile,
} from "../../../components/patients/patientProfileForm";
import { usePatientStore } from "../../../store/patientStore";
import PatientUserGate from "./components/PatientUserGate";
import notify from "./notify";
import { PATIENTS_PATH, patientUserPath } from "./patientPaths";

/*
  The medical profile form for a Patient user without one. The user id comes
  from the URL (the selected user), never from the form. Saving sends
  POST /Patients; on failure the entered values stay so the admin can retry.
*/
const CompletePatientForm = ({ user }) => {
  const navigate = useNavigate();

  const createPatientProfile = usePatientStore((state) => state.createPatientProfile);
  const isSaving = usePatientStore((state) => state.isCreatingProfile);
  const error = usePatientStore((state) => state.createProfileError);
  const clearError = usePatientStore((state) => state.clearCreateProfileError);

  const [values, setValues] = useState(INITIAL_PROFILE_VALUES);
  const [errors, setErrors] = useState({});

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

    const nextErrors = validateProfile(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    const success = await createPatientProfile(toProfilePayload(user.id, values));

    if (success) {
      // The table reloads its data when it opens and shows the completed profile.
      notify("success", `${user.userName}'s patient account was completed`);
      navigate(PATIENTS_PATH);
    } else if (usePatientStore.getState().inactiveProfileUserIds.includes(user.id)) {
      // The user already has a profile (inactive): nothing to complete.
      notify("info", `${user.userName} already has a patient profile, which is inactive`);
      navigate(PATIENTS_PATH);
    }
  };

  return (
    <>
      <div>
        <h1 className="text-4xl font-medium text-[#0b2a3d]">
          Complete patient account
        </h1>

        <p className="mt-3 text-sm text-slate-500">
          Enter the medical information for <strong>{user.userName}</strong>.
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7"
      >
        <h2 className="text-base font-medium text-[#0b2a3d]">
          Patient medical profile
        </h2>

        <p className="mt-1 text-xs text-slate-400">
          Date of birth, gender and medical record number are required.
        </p>

        <div className="mt-6">
          <PatientProfileFields
            values={values}
            errors={errors}
            onChange={handleChange}
            disabled={isSaving}
          />
        </div>

        <div className="mt-8 flex justify-end gap-3 border-t border-slate-200 pt-6">
          <button
            type="button"
            onClick={() => navigate(patientUserPath(user.id))}
            disabled={isSaving}
            className="rounded-xl border border-slate-200 bg-white px-6 py-4 text-xs font-bold text-[#0b2a3d] transition hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 rounded-xl bg-[#0f3d4c] px-6 py-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#0b3240] disabled:opacity-70"
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

  return (
    <PatientUserGate userId={userId} current="Complete account">
      {(user) => <CompletePatientForm user={user} />}
    </PatientUserGate>
  );
};

export default CompletePatientAccount;
