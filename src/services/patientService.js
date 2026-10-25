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

const patientService = {
  // GET {VITE_API_BASE_URL}/Patients/assignments  (base URL already ends with /api)
  async getPatientAssignments() {
    const { data } = await api.get("/Patients/assignments");

    return Array.isArray(data) ? data.map(mapPatientAssignment) : [];
  },
};

export default patientService;
