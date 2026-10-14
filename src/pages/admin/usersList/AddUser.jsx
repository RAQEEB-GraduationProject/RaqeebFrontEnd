import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronLeft, CircleCheck, LoaderCircle } from "lucide-react";

import { useUserStore } from "../../../store/userStore";

// Same role list as the Users page filter. Values are sent as-is to
// POST /Auth/register: capitalized, matching the "Admin" the backend
// returns on login. Not confirmed against the register contract.
const ROLE_OPTIONS = ["Admin", "Doctor", "Nurse", "Caregiver", "Patient"];

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

const inputClass = (hasError) =>
  `w-full rounded-xl border bg-white px-4 py-4 text-sm text-[#0b2a3d] outline-none transition placeholder:text-slate-400 focus:ring-2 ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
      : "border-slate-200 focus:border-teal-600 focus:ring-teal-600/20"
  }`;

const Field = ({ id, label, error, children }) => (
  <div>
    <label htmlFor={id} className="mb-2 block text-xs font-medium text-teal-800">
      {label}
    </label>

    {children}

    {error && (
      <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-red-600">
        {error}
      </p>
    )}
  </div>
);

const AddUser = () => {
  const navigate = useNavigate();

  const addUser = useUserStore((state) => state.addUser);
  const isCreating = useUserStore((state) => state.isCreating);
  const createError = useUserStore((state) => state.createError);
  const clearCreateError = useUserStore((state) => state.clearCreateError);

  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [createdUser, setCreatedUser] = useState(null);

  const goBack = () => {
    clearCreateError();
    navigate("/admin/users");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setValues((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isCreating) return;

    const nextErrors = validate(values);
    setErrors(nextErrors);
    setCreatedUser(null);

    if (Object.keys(nextErrors).length > 0) return;

    const success = await addUser({
      userName: values.userName.trim(),
      email: values.email.trim(),
      phoneNumber: values.phoneNumber.trim(),
      password: values.password,
      role: values.role,
    });

    // Only reset after the backend confirmed; on failure keep the entries.
    if (success) {
      setCreatedUser(values.userName.trim());
      setValues(INITIAL_VALUES);
    }
  };

  const fieldProps = (name) => ({
    id: name,
    name,
    value: values[name],
    onChange: handleChange,
    disabled: isCreating,
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

      {createError && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {createError}
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
          <Field id="userName" label="Full name" error={errors.userName}>
            <input
              {...fieldProps("userName")}
              type="text"
              autoComplete="off"
              placeholder="Enter full name"
              className={inputClass(errors.userName)}
            />
          </Field>

          <Field id="email" label="Hospital email" error={errors.email}>
            <input
              {...fieldProps("email")}
              type="email"
              autoComplete="off"
              placeholder="Enter hospital email"
              className={inputClass(errors.email)}
            />
          </Field>

          <Field id="phoneNumber" label="Phone number" error={errors.phoneNumber}>
            <input
              {...fieldProps("phoneNumber")}
              type="tel"
              autoComplete="off"
              placeholder="Enter phone number"
              className={inputClass(errors.phoneNumber)}
            />
          </Field>

          <Field id="password" label="Password" error={errors.password}>
            <input
              {...fieldProps("password")}
              type="password"
              autoComplete="new-password"
              placeholder="Enter password"
              className={inputClass(errors.password)}
            />
          </Field>

          <Field id="role" label="Role" error={errors.role}>
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
          </Field>
        </div>

        <div className="mt-8 flex justify-end gap-3 border-t border-slate-200 pt-6">
          <button
            type="button"
            onClick={goBack}
            disabled={isCreating}
            className="rounded-xl border border-slate-200 bg-white px-6 py-4 text-xs font-bold text-[#0b2a3d] transition hover:bg-slate-50 disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isCreating}
            className="flex items-center gap-2 rounded-xl bg-[#0f3d4c] px-6 py-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#0b3240] disabled:opacity-70"
          >
            {isCreating && <LoaderCircle size={14} className="animate-spin" />}
            {isCreating ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUser;
