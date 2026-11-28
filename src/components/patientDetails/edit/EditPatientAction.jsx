import { useState } from "react";
import { Pencil } from "lucide-react";

import EditRecordDrawer from "../../forms/EditRecordDrawer";
import PatientProfileFields from "../../patients/PatientProfileFields";
import {
  toProfileEditValues,
  validateProfileEdit,
} from "../../patients/patientProfileForm";
import patientService from "../../../services/patientService";
import { usePatientOverviewStore } from "../../../store/patientOverviewStore";
import { usePatientStore } from "../../../store/patientStore";
import notify from "../../../pages/admin/patientsList/notify";

const ERROR_OPTIONS = {
  codeFields: { MRN_ALREADY_EXISTS: "medicalRecordNumber" },
};

/*
  "Edit patient" of the patient details header: the medical profile through
  PUT /Patients/{id}. Admin only (the backend's rule), so only the admin route
  uses it. Account details (name, email, phone) are edited in Users.
*/
const EditPatientAction = () => {
  const patient = usePatientOverviewStore((state) => state.overview?.patient);
  const updatePatient = usePatientStore((state) => state.updatePatient);
  // The patient the drawer was opened for: it closes if another one is shown.
  const [openFor, setOpenFor] = useState(null);

  if (!patient) return null;

  const close = () => setOpenFor(null);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpenFor(patient.id)}
        disabled={!patient.isActive}
        title={patient.isActive ? undefined : "This patient is inactive"}
        className="inline-flex items-center gap-2 rounded-xl border border-transparent bg-primary px-5 py-3 text-sm font-semibold text-on-primary transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-disabled disabled:text-on-disabled"
      >
        <Pencil size={18} aria-hidden="true" />
        Edit patient
      </button>

      {openFor === patient.id && (
        <EditRecordDrawer
          key={patient.id}
          id={patient.id}
          eyebrow="Medical profile"
          title="Edit patient"
          description={
            <>
              Medical profile of <strong className="font-semibold">{patient.name}</strong>.
              Name, email and phone number belong to the user account.
            </>
          }
          load={patientService.getPatientById}
          toValues={toProfileEditValues}
          validate={validateProfileEdit}
          save={updatePatient}
          errorOptions={ERROR_OPTIONS}
          onSaved={() => {
            close();
            notify("success", "Patient updated");
          }}
          onClose={close}
        >
          {({ values, errors, handleChange, isSaving }) => (
            <PatientProfileFields
              values={values}
              errors={errors}
              onChange={handleChange}
              disabled={isSaving}
              withRecordNumber
            />
          )}
        </EditRecordDrawer>
      )}
    </>
  );
};

export default EditPatientAction;
