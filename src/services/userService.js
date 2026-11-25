import api from "./api";

const mapUser = (data) => ({
  id: data.id,
  userName: data.userName,
  email: data.email,
  phoneNumber: data.phoneNumber,
  role: data.role,
  hospitalId: data.hospitalId,
  isActive: data.isActive,
});

const userService = {
  async getUsers() {
    const { data } = await api.get("/Users");

    return Array.isArray(data) ? data.map(mapUser) : [];
  },

  // GET {VITE_API_BASE_URL}/Users?role=Patient  (Admin only). Every user with
  // the Patient role, whether or not a medical profile exists for them.
  async getPatientUsers() {
    const { data } = await api.get("/Users", { params: { role: "Patient" } });

    return Array.isArray(data) ? data.map(mapUser) : [];
  },

  // GET {VITE_API_BASE_URL}/Users?role=Doctor  (Admin only). Used to pick the
  // provider of a patient's appointment.
  async getDoctorUsers() {
    const { data } = await api.get("/Users", { params: { role: "Doctor" } });

    return Array.isArray(data) ? data.map(mapUser) : [];
  },

  async getUserById(id) {
    const { data } = await api.get(`/Users/${encodeURIComponent(id)}`);
    if (!data) throw new Error("The requested user was not found.");

    return mapUser(data);
  },

  // POST {VITE_API_BASE_URL}/Auth/register  (base URL already ends with /api)
  // `userName` is the login name; `fullName` is the optional display name
  // (sent as null when blank).
  async register({ userName, fullName, email, phoneNumber, password, role }) {
    const { data } = await api.post("/Auth/register", {
      userName,
      fullName: typeof fullName === "string" && fullName.trim() ? fullName.trim() : null,
      email,
      phoneNumber,
      password,
      role,
    });

    // RegisterResponseDto: { userId, userName, email, role } (no fullName)
    return {
      userId: data?.userId ?? null,
      userName: data?.userName ?? userName,
      email: data?.email ?? email,
      role: data?.role ?? role,
    };
  },
};

export default userService;
