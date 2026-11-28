import api from "./api";
import getDisplayName from "../utils/getDisplayName";
import { textOrNull } from "../utils/text";

// The fields of PUT /Patients/{id}. The backend requires every one of them in
// every request (full replacement).
const UPDATE_FIELDS = [
  "dateOfBirth",
  "gender",
  "bloodGroup",
  "medicalRecordNumber",
  "diagnosis",
  "stage",
  "treatment",
  "protocol",
  "riskLevel",
];

const unexpectedResponse = () => new Error("The server returned an unexpected response.");

const numberOrNull = (value) => (Number.isFinite(value) ? value : null);

/*
  The backend's one patient object (GET /Patients, GET /Patients/{id}, the
  POST / PUT responses and overview.patient) -> the app's patient shape.
  `id` is the patient record id; `userId` is the linked account and is never
  used for routing. `name` is for display only. `age` and `phoneNumber` come
  from the backend. Missing values stay null (no default risk level or MRN).
*/
const mapPatient = (data) => ({
  id: data.id,
  userId: data.userId,
  name: getDisplayName(data, "Unknown patient"),
  userName: textOrNull(data.userName),
  fullName: textOrNull(data.fullName),
  email: textOrNull(data.email),
  phoneNumber: textOrNull(data.phoneNumber),
  hospitalId: data.hospitalId ?? null,
  dateOfBirth: data.dateOfBirth ?? null,
  age: numberOrNull(data.age),
  gender: textOrNull(data.gender),
  bloodGroup: textOrNull(data.bloodGroup),
  medicalRecordNumber: textOrNull(data.medicalRecordNumber),
  diagnosis: textOrNull(data.diagnosis),
  stage: textOrNull(data.stage),
  treatment: textOrNull(data.treatment),
  protocol: textOrNull(data.protocol),
  risk: textOrNull(data.riskLevel),
  isActive: data.isActive,
  createdAt: data.createdAt ?? null,
});

// One care team member of the overview, or null (no active assignment).
const mapCareMember = (member) =>
  member
    ? {
        userId: member.userId,
        name: getDisplayName(member),
        userName: textOrNull(member.userName),
        fullName: textOrNull(member.fullName),
        phoneNumber: textOrNull(member.phoneNumber),
        role: textOrNull(member.role),
        assignedAt: member.assignedAt ?? null,
      }
    : null;

/*
  GET /Patients/{patientId}/overview -> data of the whole patient details page:
    patient            the patient object (header and Overview tab)
    careTeam           doctor, nurse and caregiver (each may be null)
    treatmentProgress  null until the backend has a treatment module
*/
const mapOverview = (data) => {
  if (!data.patient) throw unexpectedResponse();

  return {
    patient: mapPatient(data.patient),
    careTeam: {
      treatingDoctor: mapCareMember(data.careTeam?.treatingDoctor),
      nurse: mapCareMember(data.careTeam?.nurse),
      primaryCaregiver: mapCareMember(data.careTeam?.primaryCaregiver),
    },
    treatmentProgress: data.treatmentProgress ?? null,
  };
};

// One medical history record. `date` stays the backend's "yyyy-MM-dd" text
// (a date without time zone), or null.
const mapHistoryItem = (item) => ({
  id: item.id,
  name: textOrNull(item.name) ?? "Unnamed record",
  date: textOrNull(item.date),
  notes: textOrNull(item.notes),
});

const mapHistoryList = (list) => (Array.isArray(list) ? list.map(mapHistoryItem) : []);

// GET /Patients/{patientId}/medical-history -> the four categories (always
// arrays) + totalCount = active records across ALL four categories.
const mapMedicalHistory = (data) => {
  const history = {
    diseases: mapHistoryList(data.diseases),
    allergies: mapHistoryList(data.allergies),
    surgeries: mapHistoryList(data.surgeries),
    familyHistory: mapHistoryList(data.familyHistory),
  };

  const countedHere =
    history.diseases.length +
    history.allergies.length +
    history.surgeries.length +
    history.familyHistory.length;

  return {
    ...history,
    totalCount: numberOrNull(data.totalCount) ?? countedHere,
  };
};

// One appointment. `date` stays "yyyy-MM-dd" and `time` becomes "HH:mm" (both
// are local clinic values without a time zone, see the backend report).
const mapAppointment = (item) => ({
  id: item.appointmentId,
  title: textOrNull(item.title) ?? "Untitled appointment",
  date: textOrNull(item.appointmentDate),
  time: textOrNull(item.appointmentTime)?.slice(0, 5) ?? null,
  providerId: textOrNull(item.provider?.doctorId),
  providerName: textOrNull(item.provider?.name),
  location: textOrNull(item.location),
});

// GET /Patients/{patientId}/appointments -> { appointments (chronological), totalCount }.
const mapAppointments = (data) => {
  const appointments = Array.isArray(data.appointments)
    ? data.appointments.map(mapAppointment)
    : [];

  return {
    items: appointments,
    totalCount: numberOrNull(data.totalCount) ?? appointments.length,
  };
};

// The optional PDF attached to a diagnostic record. `fileUrl` is a protected
// API path (see diagnosticsFileService), null when there is no file.
const mapAttachment = (item) => ({
  fileName: textOrNull(item.fileName),
  fileUrl: textOrNull(item.fileUrl),
});

// One lab result. `flag` is the backend's own value ("Normal" | "High" |
// "Low" | null); nothing is derived from the result.
const mapLabResult = (item) => ({
  id: item.labResultId,
  testName: textOrNull(item.testName) ?? "Unnamed test",
  value: textOrNull(item.resultValue),
  unit: textOrNull(item.unit),
  flag: textOrNull(item.flag),
  recordedAt: textOrNull(item.recordedAt),
  ...mapAttachment(item),
});

// One imaging record. The finding is kept exactly as written.
const mapImagingRecord = (item) => ({
  id: item.imagingId,
  studyName: textOrNull(item.studyName) ?? "Unnamed study",
  studyDate: textOrNull(item.studyDate),
  finding: textOrNull(item.finding) ? item.finding : null,
  ...mapAttachment(item),
});

// A diagnostics list must be an array ([] = no records). Anything else is a
// failure, never an empty list: it must not read as "no results".
const mapDiagnosticList = (data, mapItem) => {
  if (!Array.isArray(data)) {
    throw new Error("The server returned an unexpected response.");
  }

  return data.map(mapItem);
};

const patientService = {
  // GET {VITE_API_BASE_URL}/Patients
  async getPatients() {
    const { data } = await api.get("/Patients");

    return Array.isArray(data) ? data.map(mapPatient) : [];
  },

  // GET {VITE_API_BASE_URL}/Patients/{patientId}  (any role with access to the
  // patient; 404 otherwise). Used by the edit form, so a response that lacks an
  // editable field is refused: saving it would clear that field.
  async getPatientById(patientId) {
    const { data } = await api.get(`/Patients/${encodeURIComponent(patientId)}`);

    if (!data || !UPDATE_FIELDS.every((field) => field in data)) {
      throw unexpectedResponse();
    }

    return mapPatient(data);
  },

  // PUT {VITE_API_BASE_URL}/Patients/{patientId}  (Admin only, active patients).
  // `values` must hold all nine UPDATE_FIELDS: a blank one is sent as null,
  // which clears it. A field that is missing altogether is never turned into
  // null; nothing is sent. Returns the updated patient.
  async updatePatient(patientId, values) {
    if (!UPDATE_FIELDS.every((field) => values[field] !== undefined)) {
      throw new Error("The patient data is incomplete, so it was not saved.");
    }

    const { data } = await api.put(
      `/Patients/${encodeURIComponent(patientId)}`,
      Object.fromEntries(
        UPDATE_FIELDS.map((field) => [field, textOrNull(values[field])]),
      ),
    );

    if (!data) throw unexpectedResponse();

    return mapPatient(data);
  },

  // GET {VITE_API_BASE_URL}/Patients/{patientId}/overview  (Admin, Doctor,
  // Nurse; the backend limits non-admins to their assigned patients and
  // answers 404 otherwise). Returns null when the payload is empty.
  async getPatientOverview(patientId) {
    const { data } = await api.get(
      `/Patients/${encodeURIComponent(patientId)}/overview`,
    );

    return data ? mapOverview(data) : null;
  },

  // POST {VITE_API_BASE_URL}/Patients  (Admin only). Creates the medical
  // profile of an existing user that has the Patient role. Only the fields
  // the form collected are sent; blank optional fields go as null. The
  // medical record number is not collected (and so never sent).
  // Returns the created profile (mapPatient shape); its `id` is the patientId
  // used by the patient's other endpoints (e.g. medical history).
  async createPatient({
    userId,
    dateOfBirth,
    gender,
    bloodGroup,
    diagnosis,
    stage,
    treatment,
    protocol,
    riskLevel,
  }) {
    const { data } = await api.post("/Patients", {
      userId,
      dateOfBirth,
      gender: textOrNull(gender),
      bloodGroup: textOrNull(bloodGroup),
      diagnosis: textOrNull(diagnosis),
      stage: textOrNull(stage),
      treatment: textOrNull(treatment),
      protocol: textOrNull(protocol),
      riskLevel: textOrNull(riskLevel),
    });

    return data ? mapPatient(data) : null;
  },

  // GET {VITE_API_BASE_URL}/Patients/{patientId}/medical-history  (any role
  // with access to the patient; 404 otherwise).
  async getMedicalHistory(patientId) {
    const { data } = await api.get(
      `/Patients/${encodeURIComponent(patientId)}/medical-history`,
    );

    return data ? mapMedicalHistory(data) : null;
  },

  // POST {VITE_API_BASE_URL}/Patients/{patientId}/medical-history
  // (Admin; Doctor for assigned patients). 201 -> the created record.
  // body: { type, name, date: "yyyy-MM-dd" | null, notes | null }
  async addMedicalHistoryEntry(patientId, { type, name, date, notes }) {
    const { data } = await api.post(
      `/Patients/${encodeURIComponent(patientId)}/medical-history`,
      {
        type,
        name: name.trim(),
        date: textOrNull(date),
        notes: textOrNull(notes),
      },
    );

    return data ? { ...mapHistoryItem(data), type: data.type } : null;
  },

  // GET {VITE_API_BASE_URL}/Patients/{patientId}/appointments (any role with
  // access to the patient; 404 otherwise).
  async getAppointments(patientId) {
    const { data } = await api.get(
      `/Patients/${encodeURIComponent(patientId)}/appointments`,
    );

    return data ? mapAppointments(data) : null;
  },

  // POST {VITE_API_BASE_URL}/Patients/{patientId}/appointments (Admin; Doctor
  // for assigned patients). 201 -> the created appointment.
  // body: { title, appointmentDate: "yyyy-MM-dd", appointmentTime: "HH:mm:ss",
  //         providerId: <Doctor user id>, location | null }
  async addAppointment(patientId, { title, date, time, providerId, location }) {
    const { data } = await api.post(
      `/Patients/${encodeURIComponent(patientId)}/appointments`,
      {
        title: title.trim(),
        appointmentDate: date,
        appointmentTime: time.length === 5 ? `${time}:00` : time,
        providerId,
        location: textOrNull(location),
      },
    );

    return data ? mapAppointment(data) : null;
  },

  // GET {VITE_API_BASE_URL}/Patients/{patientId}/diagnostics/labs (any role
  // with access to the patient; 404 otherwise). Newest first.
  async getLabResults(patientId) {
    const { data } = await api.get(
      `/Patients/${encodeURIComponent(patientId)}/diagnostics/labs`,
    );

    return mapDiagnosticList(data, mapLabResult);
  },

  // GET {VITE_API_BASE_URL}/Patients/{patientId}/diagnostics/imaging (same
  // access rule). Newest first.
  async getImagingRecords(patientId) {
    const { data } = await api.get(
      `/Patients/${encodeURIComponent(patientId)}/diagnostics/imaging`,
    );

    return mapDiagnosticList(data, mapImagingRecord);
  },
};

export default patientService;
