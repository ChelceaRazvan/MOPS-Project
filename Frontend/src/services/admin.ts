
import api from "./api";

export type ApiAdminUser = {
  id: number;
  username: string;
  roleId: number;
  roleName: string | null;
  employee?: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    roleInCompany?: string | null;
    phone?: string | null;
    salary?: number | null;
    email?: string | null;
  } | null;
};

export async function adminListUsers(): Promise<ApiAdminUser[]> {
  const { data } = await api.get("/admin/users");
  return data;
}

export async function adminGetUserInfo(id: number) {
  const { data } = await api.get(`/admin/users/${id}`);
  return data as {
    id: number;
    username: string;
    roleId?: number | null;
    roleName?: string | null;
    employee?: {
      id?: number | null;
      firstName?: string | null;
      lastName?: string | null;
      roleInCompany?: string | null;
      phone?: string | null;
      salary?: number | null;
      email?: string | null;
    } | null;
  };
}

export type AdminUpdateUserPayload = {
  username?: string;
  roleName?: string;
  roleId?: number;
  phone?: string;
  salary?: number | null;
  email?: string;
};



export async function adminUpdateUser(
  id: number,
  payload: AdminUpdateUserPayload
) {
  const { username, roleName, roleId, phone, email, salary } = payload;

  const hasEmployeeFields =
    phone !== undefined || email !== undefined || salary !== undefined;

  if (hasEmployeeFields) {
    // Trimit PUT /account când ai employee fields
    const accountPayload = {
      user: { username, roleName, roleId },
      employee: { phone, email, salary },
    };
    const { data } = await api.put(`/admin/users/${id}/account`, accountPayload);
    return data; // poți ignora răspunsul sau îl poți tipa, backend-ul tău poate întoarce {"status": "ok"}
  } else {
    // Fallback: PATCH ca înainte
    const { data } = await api.patch(`/admin/users/${id}`, {
      username,
      roleName,
      roleId,
    });
    return data as { id: number; username: string; roleId: number | null };
  }
}



export async function adminUpdatePassword(id: number, newPassword: string) {
  const { data } = await api.put(`/admin/users/${id}/password`, { newPassword });
  return data as { status: "ok" };
}
