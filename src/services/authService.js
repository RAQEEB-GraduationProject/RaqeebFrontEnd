import api from "./api";

/*
  شكل الـ response من الباك:
  { token, expiration, userId, userName, role: "Admin", hospitalId }

  بنحوّله لشكل نظيف نخزنه في الـ store:
  { token, expiration, user: { userId, userName, name, role: "admin", hospitalId } }
*/
const mapLoginResponse = (data) => ({
  token: data.token,
  expiration: data.expiration,
  user: {
    userId: data.userId,
    userName: data.userName,
    // اسم العرض في الـ Layouts. حالياً = userName، ولما الباك يرجّع الاسم الكامل نغيّره هنا
    name: data.userName,
    // الباك بيبعت "Admin"، والـ routes عندنا بحروف صغيرة
    role: String(data.role).toLowerCase(),
    hospitalId: data.hospitalId,
  },
});

const authService = {
  async login({ userName, password }) {
    const { data } = await api.post("/Auth/login", { userName, password });
    return mapLoginResponse(data);
  },

  // TODO: لما الباك يجهز endpoint الـ logout (Token Revocation)
  // async logout() { await api.post("/Auth/logout"); },
};

export default authService;
