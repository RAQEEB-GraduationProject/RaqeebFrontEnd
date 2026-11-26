import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronLeft, CircleCheck, LoaderCircle } from "lucide-react";

import FormField from "../../../components/forms/FormField";
import inputClass from "../../../components/forms/inputClass";
import PatientProfileFields from "../../../components/patients/PatientProfileFields";
import MedicalHistoryStep from "../../../components/patients/medicalHistory/MedicalHistoryStep";
import {
  INITIAL_PROFILE_VALUES,
  toProfilePayload,
  validateProfile,
} from "../../../components/patients/patientProfileForm";
import { usePatientStore } from "../../../store/patientStore";
import { useUserStore } from "../../../store/userStore";

// Same role list as the Users page filter. Values are sent as-is to
// POST /Auth/register: capitalized, matching the "Admin" the backend
// returns on login. Not confirmed against the register contract.
const ROLE_OPTIONS = ["Admin", "Doctor", "Nurse", "Caregiver", "Patient"];

const PATIENT_ROLE = "Patient";

// Patients registered here are always Female (fixed, not editable).
const PATIENT_GENDER = "Female";
const INITIAL_PATIENT_PROFILE = { ...INITIAL_PROFILE_VALUES, gender: PATIENT_GENDER };

const INITIAL_VALUES = {
  userName: "",
  fullName: "",
  email: "",
  phoneNumber: "",
  password: "",
  role: "Patient",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9\s-]{7,15}$/;
// ASP.NET Identity's default allowed user name characters (no spaces).
const USERNAME_PATTERN = /^[A-Za-z0-9\-._@+]+$/;

const validate = (values) => {
  const errors = {};

  if (!values.userName.trim()) {
    errors.userName = "Username is required.";
  } else if (!USERNAME_PATTERN.test(values.userName.trim())) {
    errors.userName = "Use letters, numbers and - . _ @ + only (no spaces).";
  }

  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.phoneNumber.trim()) {
    errors.phoneNumber = "Phone number is required.";
  } else if (!PHONE_PATTERN.test(values.phoneNumber.trim())) {
    errors.phoneNumber = "Enter a valid phone number.";
  }

  if (!values.password) {
    errors.password = "Password is required.";
  }

  if (!values.role) {
    errors.role = "Role is required.";
  }

  return errors;
};

const AddUser = () => {
  const navigate = useNavigate();

  const addUser = useUserStore((state) => state.addUser);
  const isCreating = useUserStore((state) => state.isCreating);
  const createError = useUserStore((state) => state.createError);
  const clearCreateError = useUserStore((state) => state.clearCreateError);

  const createPatientProfile = usePatientStore((state) => state.createPatientProfile);
  const isCreatingProfile = usePatientStore((state) => state.isCreatingProfile);
  const createProfileError = usePatientStore((state) => state.createProfileError);
  const clearCreateProfileError = usePatientStore(
    (state) => state.clearCreateProfileError,
  );

  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [createdUser, setCreatedUser] = useState(null);

  // Set once a Patient account exists: { userId, userName }. While it is set
  // the account fields are locked and the medical profile section is shown;
  // it is kept after a failed profile save so the user can retry.
  const [pendingPatient, setPendingPatient] = useState(null);
  const [profileValues, setProfileValues] = useState(INITIAL_PATIENT_PROFILE);
  const [profileErrors, setProfileErrors] = useState({});

  // Set once the medical profile exists: { patientId, userName }. Shows the
  // optional medical history step for that patientId (from POST /Patients).
  const [historyPatient, setHistoryPatient] = useState(null);

  const isBusy = isCreating || isCreatingProfile;

  const goBack = () => {
    clearCreateError();
    clearCreateProfileError();
    navigate("/admin/users");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setValues((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;

    setProfileValues((prev) => ({ ...prev, [name]: value }));

    if (profileErrors[name]) {
      setProfileErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Step 1: create the account (POST /Auth/register).
  const submitAccount = async () => {
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setCreatedUser(null);

    if (Object.keys(nextErrors).length > 0) return;

    const newUser = await addUser({
      userName: values.userName.trim(),
      fullName: values.fullName,
      email: values.email.trim(),
      phoneNumber: values.phoneNumber.trim(),
      password: values.password,
      role: values.role,
    });

    // On failure keep the entries and show the error from the store.
    if (!newUser) return;

    if (values.role !== PATIENT_ROLE) {
      setCreatedUser(newUser.userName);
      setValues(INITIAL_VALUES);
      return;
    }

    // Patient: keep the entries, remember the new id and reveal the profile.
    if (!newUser.userId) {
      setErrors({ role: "The account was created, but the server did not return its id." });
      return;
    }

    setPendingPatient({ userId: newUser.userId, userName: newUser.userName });
  };

  // Step 2: create the medical profile (POST /Patients) for the new account.
  const submitProfile = async () => {
    const nextErrors = validateProfile(profileValues);
    setProfileErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    const created = await createPatientProfile(
      toProfilePayload(pendingPatient.userId, { ...profileValues, gender: PATIENT_GENDER }),
    );

    // On failure pendingPatient stays, so the user can retry without
    // registering the account again.
    if (!created) return;

    // Step 3 (optional): medical history, now that the patientId exists.
    if (created.id) {
      setHistoryPatient({ patientId: created.id, userName: pendingPatient.userName });
      return;
    }

    finishRegistration(pendingPatient.userName);
  };

  // Ends the flow (after the profile, or after / skipping medical history).
  const finishRegistration = (userName) => {
    setCreatedUser(userName);
    setPendingPatient(null);
    setHistoryPatient(null);
    setValues(INITIAL_VALUES);
    setProfileValues(INITIAL_PATIENT_PROFILE);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isBusy) return;

    clearCreateProfileError();

    if (pendingPatient) {
      await submitProfile();
    } else {
      await submitAccount();
    }
  };

  const fieldProps = (name) => ({
    id: name,
    name,
    value: values[name],
    onChange: handleChange,
    disabled: isBusy || Boolean(pendingPatient),
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });

  return (
    <div className="mx-auto max-w-[1160px] space-y-6">
      <div>
        <button
          type="button"
          onClick={goBack}
          className="flex items-center gap-1 text-xs font-medium text-accent transition hover:text-accent-strong"
        >
          <ChevronLeft size={14} />
          Back
        </button>

        <h1 className="mt-6 text-4xl font-medium text-ink">
          Add hospital user
        </h1>

        <p className="mt-3 text-sm text-muted-strong">
          Create account access and assign an operational role.
        </p>
      </div>

      {createdUser && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl bg-success-bg px-4 py-3 text-sm text-success-text"
        >
          <CircleCheck size={18} className="mt-0.5 shrink-0" />

          <p>
            <strong>{createdUser}</strong> was created successfully.
          </p>
        </div>
      )}

      {pendingPatient && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl bg-success-bg px-4 py-3 text-sm text-success-text"
        >
          <CircleCheck size={18} className="mt-0.5 shrink-0" />

          {historyPatient ? (
            <p>
              The patient profile for <strong>{historyPatient.userName}</strong> was
              created. You can add medical history now or skip this step.
            </p>
          ) : (
            <p>
              The account for <strong>{pendingPatient.userName}</strong> was
              created. Complete the patient medical profile below.
            </p>
          )}
        </div>
      )}

      {historyPatient ? (
        <MedicalHistoryStep
          patientId={historyPatient.patientId}
          patientName={historyPatient.userName}
          onDone={() => finishRegistration(historyPatient.userName)}
        />
      ) : (
      <>
      {(createError || createProfileError) && (
        <p
          role="alert"
          className="rounded-xl bg-danger-bg px-4 py-3 text-sm text-danger-text"
        >
          {createError || createProfileError}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-7"
      >
        <h2 className="text-base font-medium text-ink">
          Account information
        </h2>

        <p className="mt-1 text-xs text-muted">
          All fields marked required must be completed.
        </p>

        <div className="mt-6 grid gap-x-5 gap-y-5 md:grid-cols-2">
          <FormField id="userName" label="Username" error={errors.userName}>
            <input
              {...fieldProps("userName")}
              type="text"
              autoComplete="off"
              placeholder="Enter username (used to sign in)"
              className={inputClass(errors.userName)}
            />
          </FormField>

          <FormField id="fullName" label="Full name (optional)" error={errors.fullName}>
            <input
              {...fieldProps("fullName")}
              type="text"
              autoComplete="off"
              placeholder="Enter full name"
              className={inputClass(errors.fullName)}
            />
          </FormField>

          <FormField id="email" label="Email" error={errors.email}>
            <input
              {...fieldProps("email")}
              type="email"
              autoComplete="off"
              placeholder="Enter email"
              className={inputClass(errors.email)}
            />
          </FormField>

          <FormField id="phoneNumber" label="Phone number" error={errors.phoneNumber}>
            <input
              {...fieldProps("phoneNumber")}
              type="tel"
              autoComplete="off"
              placeholder="Enter phone number"
              className={inputClass(errors.phoneNumber)}
            />
          </FormField>

          <FormField id="password" label="Password" error={errors.password}>
            <input
              {...fieldProps("password")}
              type="password"
              autoComplete="new-password"
              placeholder="Enter password"
              className={inputClass(errors.password)}
            />
          </FormField>

          <FormField id="role" label="Role" error={errors.role}>
            <div className="relative">
              <select
                {...fieldProps("role")}
                className={`${inputClass(errors.role)} appearance-none pr-10`}
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink"
              />
            </div>
          </FormField>
        </div>

        {pendingPatient && (
          <div className="mt-8 border-t border-line pt-6">
            <h2 className="text-base font-medium text-ink">
              Patient medical profile
            </h2>

            <p className="mt-1 text-xs text-muted">
              Date of birth is required. Gender is fixed to Female.
            </p>

            <div className="mt-6">
              <PatientProfileFields
                values={profileValues}
                errors={profileErrors}
                onChange={handleProfileChange}
                disabled={isBusy}
                fixedGender={PATIENT_GENDER}
              />
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-end gap-3 border-t border-line pt-6">
          <button
            type="button"
            onClick={goBack}
            disabled={isBusy}
            className="rounded-xl border border-line bg-white px-6 py-4 text-xs font-bold text-ink transition hover:bg-surface-soft disabled:cursor-not-allowed disabled:border-disabled disabled:text-disabled-text disabled:hover:bg-white"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isBusy}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-4 text-xs font-bold text-on-primary shadow-sm transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-disabled disabled:text-on-disabled disabled:shadow-none"
          >
            {isBusy && <LoaderCircle size={14} className="animate-spin" />}
            {isBusy ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
      </>
      )}
    </div>
  );
};

export default AddUser;
