import AlertsView from "../../../components/alerts/AlertsView";
import { useLocalAlerts } from "../../../components/alerts/useLocalAlerts";

// Admin: every alert, all columns and filters; may export, resolve and add notes.
// Review is not offered (not specified for Admin). Data and actions are
// development-only until an alerts API exists (see useLocalAlerts).
const AlertsList = () => {
  const { alerts, resolveAlert, addNote } = useLocalAlerts();

  return (
    <AlertsView
      alerts={alerts}
      canExport
      devNotice="Development data: alerts are mock records and changes are not saved."
      onResolve={resolveAlert}
      onAddNote={addNote}
    />
  );
};

export default AlertsList;
