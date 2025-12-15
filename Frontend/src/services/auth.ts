import api from "./api";
export type RegisterPayload = {
  username: string;
  password: string;
  status?: number;
  firstName: string;
  lastName: string;
  roleInCompany?: string | null;
  phone?: string | null;
  email?: string | null;
  // Recomand: prioritate roleName (creează automat dacă nu există)
  roleName?: string;
};

export async function registerUser(payload: RegisterPayload) {
  const { data } = await api.post("/auth/register", payload);
  return data;
}

export async function loginUser(payload: { username: string; password: string }) {
  const { data } = await api.post("/auth/login", payload);
  // { token, user: { id, username, firstName, lastName, role } }
  return data;
}
