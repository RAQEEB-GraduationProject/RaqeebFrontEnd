import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { CalendarDays, ClipboardPlus, MessageSquare } from "lucide-react";
import PatientDetailsLayout from "../../../components/patientDetails/PatientDetailsLayout";
import usePatientOverview from "../../../components/patientDetails/usePatientOverview";
import { usePatientMedicalHistoryStore } from "../../../store/patientMedicalHistoryStore";
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

// Also used by the admin and nurse routes: pass that role's list path and
// `actions={null}` (the actions above are doctor-only).
const DoctorPatientDetails = ({
  listPath = LIST_PATH,
  actions = <DoctorActions />,
}) => {
  const { patientId } = useParams();

  // The only overview request of the page: this shell stays mounted while the
  // user switches tabs, so the header and every tab share one response.
  const { overview, isLoading, error, retry } = usePatientOverview(patientId);

  // The medical history (loaded by its section) is kept while the user moves
  // around this patient's details and dropped when another patient is opened
  // or the details page is left, so a later visit shows fresh records.
  const resetMedicalHistory = usePatientMedicalHistoryStore((state) => state.reset);
  useEffect(() => () => resetMedicalHistory(), [patientId, resetMedicalHistory]);

  if (!overview && !error && isLoading) {
    return (
      <div
        aria-busy="true"
        className="rounded-2xl border border-slate-100 bg-white px-6 py-14 text-center text-sm text-slate-500 shadow-sm"
      >
        Loading patient…
      </div>
    );
  }

  // Failed request (404 = not found / not assigned to this user, with the
  // backend's message) or an empty payload.
  if (error || !overview) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white px-6 py-14 text-center shadow-sm">
        <p className="text-sm font-semibold text-slate-800">
          {error ? "Couldn't load patient" : "Patient not found"}
        </p>
        {error && <p className="mt-1 text-sm text-slate-500">{error}</p>}
        <div className="mt-4 flex items-center justify-center gap-4">
          {error && (
            <button
              type="button"
              onClick={retry}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-[#3f5ea8] transition hover:bg-slate-50"
            >
              Try again
            </button>
          )}
          <Link
            to={listPath}
            className="text-sm font-semibold text-[#3f5ea8] hover:underline"
          >
            Back to patients
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PatientDetailsLayout
      patient={overview.header}
      overview={overview}
      tabs={doctorPatientTabs}
      actions={actions}
      listPath={listPath}
    />
  );
};

export default DoctorPatientDetails;
