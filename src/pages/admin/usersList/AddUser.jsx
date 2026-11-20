import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronLeft, CircleCheck, LoaderCircle } from "lucide-react";

import FormField from "../../../components/forms/FormField";
import inputClass from "../../../components/forms/inputClass";
import PatientProfileFields from "../../../components/patients/PatientProfileFields";
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

const INITIAL_VALUES = {
  userName: "",
  email: "",
  phoneNumber: "",
  password: "",
  role: "Patient",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9\s-]{7,15}$/;

const validate = (values) => {
  const errors = {};

  if (!values.userName.trim()) {
    errors.userName = "Full name is required.";
  }

  if (!values.email.trim()) {
    errors.email = "Hospital email is required.";
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
  const [profileValues, setProfileValues] = useState(INITIAL_PROFILE_VALUES);
  const [profileErrors, setProfileErrors] = useState({});

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

    const success = await createPatientProfile(
      toProfilePayload(pendingPatient.userId, profileValues),
    );

    // On failure pendingPatient stays, so the user can retry without
    // registering the account again.
    if (!success) return;

    setCreatedUser(pendingPatient.userName);
    setPendingPatient(null);
    setValues(INITIAL_VALUES);
    setProfileValues(INITIAL_PROFILE_VALUES);
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
          className="flex items-center gap-1 text-xs font-medium text-teal-800 transition hover:text-[#0f3d4c]"
        >
          <ChevronLeft size={14} />
          Back
        </button>

        <h1 className="mt-6 text-4xl font-medium text-[#0b2a3d]">
          Add hospital user
        </h1>

        <p className="mt-3 text-sm text-slate-500">
          Create account access and assign an operational role.
        </p>
      </div>

      {createdUser && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
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
          className="flex items-start gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          <CircleCheck size={18} className="mt-0.5 shrink-0" />

          <p>
            The account for <strong>{pendingPatient.userName}</strong> was
            created. Complete the patient medical profile below.
          </p>
        </div>
      )}

      {(createError || createProfileError) && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {createError || createProfileError}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7"
      >
        <h2 className="text-base font-medium text-[#0b2a3d]">
          Account information
        </h2>

        <p className="mt-1 text-xs text-slate-400">
          All fields marked required must be completed.
        </p>

        <div className="mt-6 grid gap-x-5 gap-y-5 md:grid-cols-2">
          <FormField id="userName" label="Full name" error={errors.userName}>
            <input
              {...fieldProps("userName")}
              type="text"
              autoComplete="off"
              placeholder="Enter full name"
              className={inputClass(errors.userName)}
            />
          </FormField>

          <FormField id="email" label="Hospital email" error={errors.email}>
            <input
              {...fieldProps("email")}
              type="email"
              autoComplete="off"
              placeholder="Enter hospital email"
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
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#0b2a3d]"
              />
            </div>
          </FormField>
        </div>

        {pendingPatient && (
          <div className="mt-8 border-t border-slate-200 pt-6">
            <h2 className="text-base font-medium text-[#0b2a3d]">
              Patient medical profile
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Date of birth, gender and medical record number are required.
            </p>

            <div className="mt-6">
              <PatientProfileFields
                values={profileValues}
                errors={profileErrors}
                onChange={handleProfileChange}
                disabled={isBusy}
              />
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-end gap-3 border-t border-slate-200 pt-6">
          <button
            type="button"
            onClick={goBack}
            disabled={isBusy}
            className="rounded-xl border border-slate-200 bg-white px-6 py-4 text-xs font-bold text-[#0b2a3d] transition hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isBusy}
            className="flex items-center gap-2 rounded-xl bg-[#0f3d4c] px-6 py-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#0b3240] disabled:opacity-70"
          >
            {isBusy && <LoaderCircle size={14} className="animate-spin" />}
            {isBusy ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUser;
