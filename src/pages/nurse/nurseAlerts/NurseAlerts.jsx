import AlertsView from "../../../components/alerts/AlertsView";
import { useLocalAlerts } from "../../../components/alerts/useLocalAlerts";

// Nurse: may inspect, add internal notes and mark as reviewed. Resolve is
// intentionally not passed, so the button is never rendered. The backend must
// still enforce this.
// Scoping: the backend has no alerts endpoint, so alerts cannot be limited to
// the nurse's assigned patients. The notice below says so; do not ship this
// as-is.
const COLUMNS = ["alert", "patient", "event", "color", "status", "response"];
const FILTERS = ["date", "color", "status"];

const NurseAlerts = () => {
  const { alerts, reviewAlert, addNote } = useLocalAlerts();

  return (
    <AlertsView
      alerts={alerts}
      columns={COLUMNS}
      filters={FILTERS}
      subtitle="Alerts for the patients in your care."
      devNotice="Development data: mock alerts are not limited to your assigned patients and changes are not saved."
      onReview={reviewAlert}
      onAddNote={addNote}
    />
  );
};

export default NurseAlerts;
