import api from "./api";
import { getDashboardPath } from "../utils/roles";

/*
  شكل الـ response من الباك:
  { token, expiration, userId, userName, email, phoneNumber, hospitalId, roles: ["Admin"], patientId }

  بنحوّله لشكل نظيف نخزنه في الـ store:
  { token, expiration, user: { userId, userName, name, email, phoneNumber, role: "admin", roles, hospitalId, patientId } }
*/

// الباك بيرجّع array من الـ roles. بنختار أول role ليها داشبورد في الموقع،
// ولو مفيش (Patient / Caregiver) بناخد أول واحد عشان الـ store يرفض الدخول برسالة واضحة.
const pickPrimaryRole = (roles) => {
  const normalized = (Array.isArray(roles) ? roles : [])
    .filter(Boolean)
    .map((role) => String(role).toLowerCase());
  return normalized.find((role) => getDashboardPath(role)) ?? normalized[0] ?? null;
};

const mapLoginResponse = (data) => ({
  token: data.token,
  expiration: data.expiration,
  user: {
    userId: data.userId,
    userName: data.userName,
    // اسم العرض في الـ Layouts. حالياً = userName، ولما الباك يرجّع الاسم الكامل نغيّره هنا
    name: data.userName,
    email: data.email,
    phoneNumber: data.phoneNumber,
    // الـ routes عندنا بحروف صغيرة
    role: pickPrimaryRole(data.roles),
    roles: data.roles ?? [],
    hospitalId: data.hospitalId,
    patientId: data.patientId,
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
