import api from "./api";

/*
  Assignment endpoints (PatientAssignmentsController). Response envelopes are
  stripped by the axios interceptor (see apiResponse.js), so `data` below is
  already the payload.
*/

const mapStaff = (list) =>
  Array.isArray(list)
    ? list.map((member) => ({
        // Id of the assignment record (needed to unassign); not the patientId.
        assignmentId: member.assignmentId,
        userId: member.userId,
        name: member.name,
      }))
    : [];

// PatientOverviewDto: only identity + assigned staff. Clinical fields
// (risk, diagnosis, ...) belong to the Patients API, not here.
const mapAssignment = (data) => ({
  patientId: data.patientId,
  patientName: data.patientName,
  patientCode: data.patientCode,
  assignedDoctor: mapStaff(data.assignedDoctor),
  assignedNurses: mapStaff(data.assignedNurses),
  assignedCaregivers: mapStaff(data.assignedCaregivers),
});

const assignmentService = {
  // GET {VITE_API_BASE_URL}/PatientAssignments/Assignments
  async getAssignments() {
    const { data } = await api.get("/PatientAssignments/Assignments");

    return Array.isArray(data) ? data.map(mapAssignment) : [];
  },

  // POST {VITE_API_BASE_URL}/PatientAssignments  body: { patientId, userId }
  async createAssignment({ patientId, userId }) {
    const { data } = await api.post("/PatientAssignments", {
      patientId,
      userId,
    });

    return data;
  },

  // GET /PatientAssignments/{assignmentId}
  async getAssignmentById(assignmentId) {
    const { data } = await api.get(
      `/PatientAssignments/${encodeURIComponent(assignmentId)}`,
    );

    return data;
  },

  // DELETE /PatientAssignments/{assignmentId}  (no body)
  // Soft delete: the backend sets IsActive=false on that one assignment.
  async deleteAssignment(assignmentId) {
    const { data } = await api.delete(
      `/PatientAssignments/${encodeURIComponent(assignmentId)}`,
    );

    return data;
  },

  // PATCH /PatientAssignments/{assignmentId}/reactivate  (no body)
  async reactivateAssignment(assignmentId) {
    const { data } = await api.patch(
      `/PatientAssignments/${encodeURIComponent(assignmentId)}/reactivate`,
    );

    return data;
  },
};

export default assignmentService;
