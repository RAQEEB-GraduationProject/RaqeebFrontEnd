import api from "./api";

const mapStaff = (list) =>
  Array.isArray(list)
    ? list.map((member) => ({ userId: member.userId, name: member.name }))
    : [];

const mapPatientAssignment = (data) => ({
  patientId: data.patientId,
  patientName: data.patientName,
  patientCode: data.patientCode,
  assignedDoctor: mapStaff(data.assignedDoctor),
  assignedNurses: mapStaff(data.assignedNurses),
  assignedCaregivers: mapStaff(data.assignedCaregivers),
  status: data.status,
  diagnosis: data.diagnosis,
  stage: data.stage,
  treatment: data.treatment,
  protocol: data.protocol,
  riskLevel: data.riskLevel,
});

// Blank strings and nulls both mean "not provided".
const textOrNull = (value) =>
  typeof value === "string" && value.trim() ? value.trim() : null;

// A date of birth in the future (bad data) must not produce a negative age.
const getAge = (dateOfBirth) => {
  const birth = new Date(dateOfBirth);
  if (!dateOfBirth || Number.isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const hadBirthday =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!hadBirthday) age -= 1;

  return age >= 0 ? age : null;
};

// GET /Patients item -> shape used by the doctor's patient list and details.
// `id` is the patient record id; `userId` is the linked account and is never
// used for routing. Missing values stay null (no default risk level).
const mapPatient = (data) => ({
  id: data.id,
  userId: data.userId,
  name: textOrNull(data.userName) ?? textOrNull(data.email) ?? "Unknown patient",
  email: textOrNull(data.email),
  hospitalId: data.hospitalId ?? null,
  dateOfBirth: data.dateOfBirth ?? null,
  age: getAge(data.dateOfBirth),
  gender: textOrNull(data.gender),
  medicalRecordNumber: textOrNull(data.medicalRecordNumber),
  diagnosis: textOrNull(data.diagnosis),
  stage: textOrNull(data.stage),
  treatment: textOrNull(data.treatment),
  protocol: textOrNull(data.protocol),
  risk: textOrNull(data.riskLevel),
  isActive: data.isActive,
  createdAt: data.createdAt ?? null,
});

const patientService = {
  // GET {VITE_API_BASE_URL}/Patients  -> direct JSON array
  async getPatients() {
    const { data } = await api.get("/Patients");

    return Array.isArray(data) ? data.map(mapPatient) : [];
  },

  // GET {VITE_API_BASE_URL}/Patients/assignments  (base URL already ends with /api)
  async getPatientAssignments() {
    const { data } = await api.get("/Patients/assignments");

    return Array.isArray(data) ? data.map(mapPatientAssignment) : [];
  },

  // POST {VITE_API_BASE_URL}/PatientAssignments  body: { patientId, userId }
  async createAssignment({ patientId, userId }) {
    const { data } = await api.post("/PatientAssignments", {
      patientId,
      userId,
    });

    return data;
  },
};

export default patientService;
