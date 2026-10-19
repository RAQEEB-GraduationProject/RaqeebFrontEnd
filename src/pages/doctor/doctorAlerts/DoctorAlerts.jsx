import AlertsView from "../../../components/alerts/AlertsView";
import { useLocalAlerts } from "../../../components/alerts/useLocalAlerts";

// Doctor alerts (separate from Notifications): may inspect, add notes, mark as
// reviewed and resolve.
// Scoping is NOT implemented: the backend has no alerts API yet, so every mock
// alert is shown. Alerts must be limited to the doctor's assigned patients
// server-side once the API exists (see docs/backend-api-requirements.md).
const COLUMNS = ["alert", "patient", "event", "color", "status", "response"];
const FILTERS = ["date", "color", "status"];

const DoctorAlerts = () => {
  const { alerts, resolveAlert, reviewAlert, addNote } = useLocalAlerts();

  return (
    <AlertsView
      alerts={alerts}
      columns={COLUMNS}
      filters={FILTERS}
      subtitle="Review and resolve patient alerts."
      devNotice="Development data: these are mock alerts, not filtered to your assigned patients, and changes are not saved (they are lost on reload)."
      onResolve={resolveAlert}
      onReview={reviewAlert}
      onAddNote={addNote}
    />
  );
};

export default DoctorAlerts;
