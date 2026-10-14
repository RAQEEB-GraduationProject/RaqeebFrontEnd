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

  async getUserById(id) {
    const { data } = await api.get(`/Users/${encodeURIComponent(id)}`);

    return mapUser(data);
  },

  // POST {VITE_API_BASE_URL}/Auth/register  (base URL already ends with /api)
  async register({ userName, email, phoneNumber, password, role }) {
    const { data } = await api.post("/Auth/register", {
      userName,
      email,
      phoneNumber,
      password,
      role,
    });

    return data;
  },
};

export default userService;
