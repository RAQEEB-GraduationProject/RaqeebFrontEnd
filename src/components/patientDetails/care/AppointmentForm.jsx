import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

import FormField from "../../forms/FormField";
import inputClass from "../../forms/inputClass";
import { useAuthStore } from "../../../store/authStore";
import { usePatientCareStore } from "../../../store/patientCareStore";
import getErrorMessage from "../../../utils/getErrorMessage";
import { ROLES } from "../../../utils/roles";
import CareFormActions from "./CareFormActions";
import {
  APPOINTMENT_ALIASES,
  APPOINTMENT_FIELDS,
  INITIAL_APPOINTMENT_VALUES,
  LOCATION_MAX_LENGTH,
  TITLE_MAX_LENGTH,
  toFieldErrors,
  validateAppointment,
} from "./patientCareForm";

/*
  POST /Patients/{patientId}/appointments. The provider must be a Doctor's
  user id: an Admin picks one (GET /Users?role=Doctor, Admin only); a Doctor
  is the provider of the appointments they add (no doctor list is available
  to them). Backend errors: 400 -> per-field messages (INVALID_PROVIDER ->
  provider); 403 / 404 / 409 -> the message.
*/
const AppointmentForm = ({ patientId, onAdded, onCancel }) => {
  const user = useAuthStore((state) => state.user);
  const addAppointment = usePatientCareStore((state) => state.addAppointment);
  const isAdding = usePatientCareStore((state) => state.isAdding);
  const doctors = usePatientCareStore((state) => state.doctors);
  const fetchDoctors = usePatientCareStore((state) => state.fetchDoctors);

  const picksProvider = user?.role === ROLES.ADMIN;
  const ownProviderId = user?.role === ROLES.DOCTOR ? (user.userId ?? "") : "";

  const [values, setValues] = useState({
    ...INITIAL_APPOINTMENT_VALUES,
    providerId: ownProviderId,
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    if (picksProvider && !doctors.items && !doctors.isLoading && !doctors.error) {
      fetchDoctors();
    }
  }, [picksProvider, doctors, fetchDoctors]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isAdding) return;

    setFormError(null);
    const nextErrors = validateAppointment(values);
    setErrors(nextErrors);
    // The provider field only exists for an Admin: report a missing id here.
    if (!picksProvider && nextErrors.providerId) {
      setFormError("Your account has no doctor id, so an appointment can't be created.");
    }
    if (Object.keys(nextErrors).length > 0) return;

    const { entry, error } = await addAppointment(patientId, values);

    if (error) {
      const { fieldErrors, otherMessages } = toFieldErrors(
        error.errors,
        APPOINTMENT_FIELDS,
        APPOINTMENT_ALIASES,
      );
      // A provider message has nowhere to show for a Doctor (no field).
      if (!picksProvider && fieldErrors.providerId) {
        otherMessages.push(fieldErrors.providerId);
        delete fieldErrors.providerId;
      }
      setErrors(fieldErrors);
      setFormError(
        otherMessages.length > 0
          ? otherMessages.join(" ")
          : Object.keys(fieldErrors).length > 0
            ? null
            : getErrorMessage(error),
      );
      return;
    }

    onAdded?.(entry);
  };

  const bind = (name) => ({
    id: `appointment-${name}`,
    name,
    value: values[name],
    onChange: handleChange,
    disabled: isAdding,
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `appointment-${name}-error` : undefined,
  });

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {formError && (
        <p role="alert" className="rounded-xl bg-danger-bg px-4 py-3 text-sm text-danger-text">
          {formError}
        </p>
      )}

      <FormField id="appointment-title" label="Title" error={errors.title}>
        <input
          {...bind("title")}
          type="text"
          autoComplete="off"
          maxLength={TITLE_MAX_LENGTH}
          placeholder="e.g. Follow-up visit"
          className={inputClass(errors.title)}
        />
      </FormField>

      <div className="grid gap-x-5 gap-y-5 md:grid-cols-2">
        <FormField id="appointment-date" label="Date" error={errors.date}>
          <input {...bind("date")} type="date" className={inputClass(errors.date)} />
        </FormField>

        <FormField id="appointment-time" label="Time" error={errors.time}>
          <input {...bind("time")} type="time" className={inputClass(errors.time)} />
        </FormField>
      </div>

      {picksProvider && (
        <FormField id="appointment-providerId" label="Provider" error={errors.providerId}>
          <div className="relative">
            <select
              {...bind("providerId")}
              disabled={isAdding || doctors.isLoading}
              className={`${inputClass(errors.providerId)} appearance-none pr-10`}
            >
              <option value="">
                {doctors.isLoading ? "Loading doctors…" : "Select a doctor"}
              </option>
              {(doctors.items ?? []).map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.userName}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink"
            />
          </div>
          {doctors.error && (
            <p role="alert" className="mt-1.5 text-xs text-danger-text">
              Couldn&apos;t load doctors: {doctors.error}{" "}
              <button type="button" onClick={fetchDoctors} className="font-semibold underline">
                Try again
              </button>
            </p>
          )}
        </FormField>
      )}

      <FormField id="appointment-location" label="Location (optional)" error={errors.location}>
        <input
          {...bind("location")}
          type="text"
          autoComplete="off"
          maxLength={LOCATION_MAX_LENGTH}
          placeholder="e.g. Clinic 3"
          className={inputClass(errors.location)}
        />
      </FormField>

      <CareFormActions isAdding={isAdding} onCancel={onCancel} />
    </form>
  );
};

export default AppointmentForm;
