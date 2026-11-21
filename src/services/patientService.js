import api from "./api";

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

const numberOrNull = (value) => (Number.isFinite(value) ? value : null);

// GET /Patients/{patientId}/overview -> data of the whole patient details page:
//   header   -> shared patient header (same field names as mapPatient, so
//               PatientDetailsHeader reads both shapes; patientCode is the
//               backend's MedicalRecordNumber)
//   clinical / personal -> Patient Overview tab
// Missing values stay null (treatment status and cycle fields are null until
// the backend's chemotherapy module fills them; no default risk level).
const mapOverview = (data) => {
  const header = data.patientHeader ?? {};
  const clinical = data.clinicalOverview ?? {};
  const personal = data.personalInfo ?? {};

  return {
    header: {
      id: header.patientId,
      name: textOrNull(header.fullName) ?? "Unknown patient",
      medicalRecordNumber: textOrNull(header.patientCode),
      age: numberOrNull(header.age),
      gender: textOrNull(header.gender),
      bloodGroup: textOrNull(header.bloodGroup),
      risk: textOrNull(header.riskLevel),
    },
    clinical: {
      cancerType: textOrNull(clinical.cancerType),
      stage: textOrNull(clinical.stage),
      treatingDoctor: textOrNull(clinical.treatingDoctor?.name),
      treatmentStatus: textOrNull(clinical.treatmentStatus),
      protocol: textOrNull(clinical.protocol),
      currentCycle: numberOrNull(clinical.currentCycle),
      totalCycles: numberOrNull(clinical.totalCycles),
      currentDay: numberOrNull(clinical.currentDay),
    },
    personal: {
      phone: textOrNull(personal.phone),
      primaryCaregiver: textOrNull(personal.primaryCaregiver),
    },
  };
};

const patientService = {
  // GET {VITE_API_BASE_URL}/Patients  -> direct JSON array
  async getPatients() {
    const { data } = await api.get("/Patients");

    return Array.isArray(data) ? data.map(mapPatient) : [];
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
  // the form collected are sent; blank optional fields go as null.
  async createPatient({
    userId,
    dateOfBirth,
    gender,
    medicalRecordNumber,
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
      medicalRecordNumber: textOrNull(medicalRecordNumber),
      diagnosis: textOrNull(diagnosis),
      stage: textOrNull(stage),
      treatment: textOrNull(treatment),
      protocol: textOrNull(protocol),
      riskLevel: textOrNull(riskLevel),
    });

    return data;
  },
};

export default patientService;
