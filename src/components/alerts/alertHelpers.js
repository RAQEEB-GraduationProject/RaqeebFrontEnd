import { mockPatients } from "../../data/mockPatients";
import { mockStaff } from "../../data/mockStaff";

const patientsById = Object.fromEntries(mockPatients.map((p) => [p.id, p]));
const staffById = Object.fromEntries(mockStaff.map((s) => [s.id, s]));

// Adds the patient and assigned-doctor names used by the list and details.
export const enrichAlert = (alert) => {
  const patient = patientsById[alert.patientId];
  const doctor = staffById[patient?.assigned?.doctor?.[0]];

  return {
    ...alert,
    patientName: patient?.userName ?? "Unknown patient",
    doctorId: doctor?.id ?? "",
    doctorName: doctor ? `Dr. ${doctor.name}` : "Unassigned",
  };
};

const pad = (n) => String(n).padStart(2, "0");

export const formatClock = (date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

export const formatGenerated = (iso) => {
  const date = new Date(iso);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();

  const day = isToday
    ? "Today"
    : date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  return `${day} · ${formatClock(date)}`;
};

export const formatResponse = (minutes) => {
  if (minutes == null) return "—";
  if (minutes < 60) return `${minutes} min`;

  const rest = minutes % 60;
  return rest ? `${Math.floor(minutes / 60)}h ${rest}m` : `${Math.floor(minutes / 60)}h`;
};

// yyyy-mm-dd in local time, matching <input type="date"> values.
export const toDateKey = (iso) => {
  const date = new Date(iso);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const csvCell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

export const alertsToCsv = (alerts) =>
  [
    ["Alert", "Generated", "Patient", "Event", "Color", "Status", "Doctor", "Response"],
    ...alerts.map((a) => [
      a.id,
      formatGenerated(a.createdAt),
      a.patientName,
      a.event,
      a.color,
      a.status,
      a.doctorName,
      formatResponse(a.responseMinutes),
    ]),
  ]
    .map((row) => row.map(csvCell).join(","))
    .join("\r\n");
