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
};

export default userService;
