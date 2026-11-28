import api from "./api";
import getDisplayName from "../utils/getDisplayName";
import { textOrNull } from "../utils/text";

// The body of PUT /Users/{id}. The backend requires all three in every request.
const UPDATE_FIELDS = ["fullName", "email", "phoneNumber"];

const unexpectedResponse = () => new Error("The server returned an unexpected response.");

// UserResponseDto -> the app's user shape. fullName, email and phoneNumber may
// be null. `name` is for display only.
const mapUser = (data) => ({
  id: data.id,
  name: getDisplayName(data),
  userName: textOrNull(data.userName),
  fullName: textOrNull(data.fullName),
  email: textOrNull(data.email),
  phoneNumber: textOrNull(data.phoneNumber),
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

  // GET {VITE_API_BASE_URL}/Users/{id}  (Admin only). Fills the details page and
  // the edit form, so a response that lacks an editable field is refused:
  // saving it would clear that field.
  async getUserById(id) {
    const { data } = await api.get(`/Users/${encodeURIComponent(id)}`);
    if (!data) throw new Error("The requested user was not found.");
    if (!UPDATE_FIELDS.every((field) => field in data)) throw unexpectedResponse();

    return mapUser(data);
  },

  // PUT {VITE_API_BASE_URL}/Users/{id}  (Admin only). `values` must hold all
  // three UPDATE_FIELDS: a blank full name or phone number is sent as null,
  // which clears it. User name, role and password are never sent. Returns the
  // updated user.
  async updateUser(id, values) {
    if (!UPDATE_FIELDS.every((field) => values[field] !== undefined)) {
      throw new Error("The account data is incomplete, so it was not saved.");
    }

    const { data } = await api.put(`/Users/${encodeURIComponent(id)}`, {
      fullName: textOrNull(values.fullName),
      email: textOrNull(values.email),
      phoneNumber: textOrNull(values.phoneNumber),
    });

    if (!data) throw unexpectedResponse();

    return mapUser(data);
  },

  // POST {VITE_API_BASE_URL}/Auth/register  (base URL already ends with /api)
  // `userName` is the login name; `fullName` is the optional display name
  // (sent as null when blank).
  async register({ userName, fullName, email, phoneNumber, password, role }) {
    const { data } = await api.post("/Auth/register", {
      userName,
      fullName: textOrNull(fullName),
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
