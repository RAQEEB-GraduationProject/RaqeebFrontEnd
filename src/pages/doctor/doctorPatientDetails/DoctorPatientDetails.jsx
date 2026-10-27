import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { CalendarDays, ClipboardPlus, MessageSquare } from "lucide-react";
import PatientDetailsLayout from "../../../components/patientDetails/PatientDetailsLayout";
import { usePatientStore } from "../../../store/patientStore";
import { doctorPatientTabs } from "./doctorPatientTabs";

const LIST_PATH = "/doctor/patients";

// TODO: wire these up when messaging, scheduling and clinical notes exist.
const actionClass =
  "inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60";

const DoctorActions = () => (
  <>
    <button
      type="button"
      disabled
      title="Coming soon"
      className={`${actionClass} border-slate-200 bg-white text-slate-800`}
    >
      <MessageSquare size={18} />
      Message
    </button>
    <button
      type="button"
      disabled
      title="Coming soon"
      className={`${actionClass} border-slate-200 bg-white text-slate-800`}
    >
      <CalendarDays size={18} />
      Schedule
    </button>
    <button
      type="button"
      disabled
      title="Coming soon"
      className={`${actionClass} border-transparent bg-[#6f8fd6] text-white`}
    >
      <ClipboardPlus size={18} />
      Add clinical note
    </button>
  </>
);

const DoctorPatientDetails = () => {
  const { patientId } = useParams();

  const patient = usePatientStore((state) =>
    state.doctorPatients.find((p) => p.id === patientId),
  );
  const isLoaded = usePatientStore((state) => state.doctorPatientsLoaded);
  const isLoading = usePatientStore((state) => state.isDoctorPatientsLoading);
  const error = usePatientStore((state) => state.doctorPatientsError);
  const fetchPatients = usePatientStore((state) => state.fetchDoctorPatients);

  // Opened directly (refresh / shared link): the list was never fetched.
  useEffect(() => {
    if (!isLoaded) fetchPatients();
  }, [isLoaded, fetchPatients]);

  if (!patient && !error && (isLoading || !isLoaded)) {
    return (
      <div
        aria-busy="true"
        className="rounded-2xl border border-slate-100 bg-white px-6 py-14 text-center text-sm text-slate-500 shadow-sm"
      >
        Loading patient…
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white px-6 py-14 text-center shadow-sm">
        <p className="text-sm font-semibold text-slate-800">
          {error ? "Couldn't load patient" : "Patient not found"}
        </p>
        {error && <p className="mt-1 text-sm text-slate-500">{error}</p>}
        <Link
          to={LIST_PATH}
          className="mt-4 inline-block text-sm font-semibold text-[#3f5ea8] hover:underline"
        >
          Back to patients
        </Link>
      </div>
    );
  }

  return (
    <PatientDetailsLayout
      patient={patient}
      tabs={doctorPatientTabs}
      actions={<DoctorActions />}
      listPath={LIST_PATH}
    />
  );
};

export default DoctorPatientDetails;
