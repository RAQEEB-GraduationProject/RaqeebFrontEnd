// TODO: replace with API when backend is ready (alerts). No alerts endpoint exists yet.
// `patientId` references data/mockPatients.js; the doctor shown is the patient's
// assigned doctor (see data/mockStaff.js).

export const ALERT_COLORS = ["Red", "Orange", "Yellow", "Green"];
export const ALERT_STATUSES = ["Open", "Escalated", "Acknowledged", "Resolved"];

// Timestamps are built relative to today so the mock alerts read as "Today".
const todayAt = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
};

export const mockAlerts = [
  {
    id: "ALT-4018",
    patientId: 1,
    event: "Low SpO₂ · 89%",
    color: "Red",
    status: "Open",
    createdAt: todayAt("09:42"),
    responseMinutes: 8,
    source: "Patient daily check-in",
    rule: "CTCAE Dyspnea v4.1",
    timeline: [
      { time: "09:42", title: "Alert generated", detail: "Red threshold detected" },
      { time: "09:45", title: "Doctor notified", detail: "Push and SignalR delivered" },
      { time: "09:50", title: "Acknowledged", detail: "Doctor opened alert" },
      { time: "10:00", title: "Care team contacted", detail: "Patient callback initiated", tone: "alert" },
    ],
    notes: [],
  },
  {
    id: "ALT-4017",
    patientId: 2,
    event: "Temperature · 38.2°C",
    color: "Orange",
    status: "Escalated",
    createdAt: todayAt("09:42"),
    responseMinutes: 18,
    source: "Wearable device",
    rule: "CTCAE Fever v2.8",
    timeline: [
      { time: "09:42", title: "Alert generated", detail: "Orange threshold detected" },
      { time: "09:50", title: "Doctor notified", detail: "Push and SignalR delivered" },
      { time: "10:00", title: "Escalated", detail: "No response within 15 min", tone: "alert" },
    ],
    notes: [],
  },
  {
    id: "ALT-4016",
    patientId: 3,
    event: "Missed medication",
    color: "Yellow",
    status: "Acknowledged",
    createdAt: todayAt("09:42"),
    responseMinutes: 32,
    source: "Medication schedule",
    rule: "Missed dose rule",
    timeline: [
      { time: "09:42", title: "Alert generated", detail: "Dose not confirmed" },
      { time: "10:14", title: "Acknowledged", detail: "Doctor opened alert" },
    ],
    notes: [],
  },
  {
    id: "ALT-4015",
    patientId: 4,
    event: "Check-in completed",
    color: "Green",
    status: "Resolved",
    createdAt: todayAt("09:42"),
    responseMinutes: 72,
    source: "Patient daily check-in",
    rule: "Daily check-in",
    timeline: [
      { time: "09:42", title: "Alert generated", detail: "Check-in submitted" },
      { time: "10:54", title: "Resolved", detail: "Reviewed by doctor" },
    ],
    notes: [],
  },
];
