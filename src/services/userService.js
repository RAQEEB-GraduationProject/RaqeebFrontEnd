import api from "./api";

/*
  شكل اليوزر من الباك:
  { id, userName, email, phoneNumber, role: "Doctor", hospitalId, isActive }
*/
const mapUser = (data) => ({
  id: data.id,
  userName: data.userName,
  email: data.email,
  phoneNumber: data.phoneNumber,
  role: data.role, // بنسيبه زي ما جاي ("Doctor") عشان العرض
  hospitalId: data.hospitalId,
  isActive: data.isActive,
});

const userService = {
  async getUsers() {
    const { data } = await api.get("/Users");
    return Array.isArray(data) ? data.map(mapUser) : [];
  },

  // TODO: getUserById, createUser, updateUser, toggleUserStatus, deleteUser
};

export default userService;
