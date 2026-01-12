
import React from "react";
import {
  adminListUsers,
  adminGetUserInfo,
  adminUpdateUser,
  adminUpdatePassword,
} from "../services/admin";
import { getApiErrorMessage } from "../services/error";
import "../styles/global.css";
import "../styles/dashboard.css";
import "../styles/admin_users.css";

// Tipuri stricte pentru payload-ul backend (lista)
type ApiAdminUser = {
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

// Tip local folosit în UI
type AdminUser = {
  id: number;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  role?: string | null;
};

// Tip pentru detaliile extinse (din GET /admin/users/{id})
type AdminUserDetail = {
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

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  const [openUserId, setOpenUserId] = React.useState<number | null>(null);

  const [detailById, setDetailById] = React.useState<Record<number, AdminUserDetail | null>>({});
  const [actionLoadingById, setActionLoadingById] = React.useState<Record<number, boolean>>({});
  const [actionErrorById, setActionErrorById] = React.useState<Record<number, string | null>>({});

  const [editUsername, setEditUsername] = React.useState<Record<number, string>>({});
  const [editRoleName, setEditRoleName] = React.useState<Record<number, string>>({});
  const [editPhone, setEditPhone] = React.useState<Record<number, string>>({});
  const [editEmail, setEditEmail] = React.useState<Record<number, string>>({});
  const [editSalary, setEditSalary] = React.useState<Record<number, number | null>>({});

  const [newPassword, setNewPassword] = React.useState<Record<number, string>>({});
  const [showUpdateUserForm, setShowUpdateUserForm] = React.useState<Record<number, boolean>>({});
  const [showUpdatePasswordForm, setShowUpdatePasswordForm] = React.useState<Record<number, boolean>>({});

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErr(null);
      try {
        // Tipăm strict lista venită din backend:
        const data: ApiAdminUser[] = await adminListUsers();

        // Mapare tipată → fără "any"
        const mapped: AdminUser[] = (data ?? []).map((u: ApiAdminUser) => ({
          id: u.id,
          username: u.username,
          firstName: u.employee?.firstName ?? null,
          lastName: u.employee?.lastName ?? null,
          role: u.roleName ?? null,
        }));
        setUsers(mapped);
      } catch (e: unknown) {
        const message = getApiErrorMessage(e);
        setErr(message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleOpen = (id: number) => {
    setOpenUserId((prev) => (prev === id ? null : id));
    setActionErrorById((prev) => ({ ...prev, [id]: null }));
  };

  const setActionLoading = (id: number, value: boolean) => {
    setActionLoadingById((prev) => ({ ...prev, [id]: value }));
  };
  const setActionError = (id: number, value: string | null) => {
    setActionErrorById((prev) => ({ ...prev, [id]: value }));
  };

  const onGetInfo = async (id: number) => {
    setActionLoading(id, true);
    setActionError(id, null);
    try {
      const info = await adminGetUserInfo(id);
      setDetailById((prev) => ({ ...prev, [id]: info }));
      setEditUsername((prev) => ({ ...prev, [id]: info?.username ?? "" }));
      setEditRoleName((prev) => ({ ...prev, [id]: info?.roleName ?? (users.find(u => u.id === id)?.role ?? "") }));
      setEditPhone(prev => ({ ...prev, [id]: info.employee?.phone ?? "" }));
      setEditEmail(prev => ({ ...prev, [id]: info.employee?.email ?? "" }));
      setEditSalary(prev => ({ ...prev, [id]: info.employee?.salary ?? null }));
    } catch (e) {
      setActionError(id, getApiErrorMessage(e));
    } finally {
      setActionLoading(id, false);
    }
  };

  
const onUpdateUser = async (id: number) => {
  setActionLoading(id, true);
  setActionError(id, null);

  try {
    const payload: {
      username?: string;
      roleName?: string;
      roleId?: number;
      phone?: string;
      salary?: number | null;
      email?: string;
    } = {};

    const newUsername = editUsername[id];
    const newRoleName = editRoleName[id]?.trim();

    if (newUsername !== undefined) payload.username = newUsername;
    if (newRoleName) payload.roleName = newRoleName;
    
    if (editPhone[id] !== undefined) payload.phone = editPhone[id];
    if (editEmail[id] !== undefined) payload.email = editEmail[id];
    if (editSalary[id] !== undefined) payload.salary = editSalary[id];

    await adminUpdateUser(id, payload);

    // Actualizăm UI local (pentru username/role)
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? {
              ...u,
              username: payload.username ?? u.username,
              role: payload.roleName ?? u.role,
            }
          : u
      )
    );

    // Actualizăm "detail" cache inclusiv employee
    setDetailById((prev) => {
      const old = prev[id];
      if (!old) return prev;
      return {
        ...prev,
        [id]: {
          ...old,
          username: payload.username ?? old.username,
          roleName: payload.roleName ?? old.roleName,
          employee: old.employee
            ? {
                ...old.employee,
                phone:
                  payload.phone !== undefined ? payload.phone : old.employee.phone,
                email:
                  payload.email !== undefined ? payload.email : old.employee.email,
                salary:
                  payload.salary !== undefined ? payload.salary : old.employee.salary,
              }
            : old.employee,
        },
      };
    });

    setShowUpdateUserForm((prev) => ({ ...prev, [id]: false }));
  } catch (e) {
    setActionError(id, getApiErrorMessage(e));
  } finally {
    setActionLoading(id, false);
  }
};

  const onUpdatePassword = async (id: number) => {
    setActionLoading(id, true);
    setActionError(id, null);
    try {
      const pwd = newPassword[id];
      if (!pwd || pwd.length < 8) {
        setActionError(id, "Parola trebuie să aibă cel puțin 8 caractere.");
      } else {
        await adminUpdatePassword(id, pwd);
        setShowUpdatePasswordForm((prev) => ({ ...prev, [id]: false }));
        setNewPassword((prev) => ({ ...prev, [id]: "" }));
      }
    } catch (e) {
      setActionError(id, getApiErrorMessage(e));
    } finally {
      setActionLoading(id, false);
    }
  };

  if (loading) return <p>Se încarcă...</p>;
  if (err) return <p className="error">{err}</p>;

  return (
    <div className="dashboard">
      <div className="topbar">
        <h2 className="title">Administrare Utilizatori</h2>
        <div className="right-actions">
          {/* Poți păstra butoanele "Admin" / "Logout" sau orice ai deja în Dashboard */}
        </div>
      </div>

      <div className="content">
        <div className="card-center admin-card">
          <div className="users-grid">
            {users.map((u) => {
              const isOpen = openUserId === u.id;
              const isBusy = !!actionLoadingById[u.id];
              const miniErr = actionErrorById[u.id];
              const detail = detailById[u.id];

              const fullName =
                `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.username;

              return (
                <div key={u.id} className={`user-card ${isOpen ? "open" : ""}`}>
                  <button
                    className="user-card-header"
                    onClick={() => toggleOpen(u.id)}
                    aria-expanded={isOpen}
                  >
                    <div className="user-name">{fullName}</div>
                    <div className="user-role">{u.role ?? "-"}</div>
                  </button>

                  {isOpen && (
                    <div className="user-dropdown">
                      <div className="user-actions">
                        <button onClick={() => onGetInfo(u.id)} disabled={isBusy}>
                          {isBusy ? "Se încarcă..." : "Detalii utilizator"}
                        </button>
                        <button
                          onClick={() =>
                            setShowUpdateUserForm((prev) => ({ ...prev, [u.id]: !prev[u.id] }))
                          }
                          disabled={isBusy}
                        >
                          Update user
                        </button>
                        <button
                          onClick={() =>
                            setShowUpdatePasswordForm((prev) => ({ ...prev, [u.id]: !prev[u.id] }))
                          }
                          disabled={isBusy}
                        >
                          Update password
                        </button>
                      </div>

                      {miniErr && <p className="error small">{miniErr}</p>}

                      {detail && (
                        <div className="user-detail">
                          <div><b>Username:</b> {detail.username}</div>
                          <div><b>Rol:</b> {detail.roleName ?? "-"}</div>
                          {detail.employee && (
                            <>
                              <div>
                                <b>Nume:</b> {detail.employee.firstName} {detail.employee.lastName}
                              </div>
                              <div><b>Funcție:</b> {detail.employee.roleInCompany ?? "-"}</div>
                              <div><b>Telefon:</b> {detail.employee.phone ?? "-"}</div>
                              <div><b>Email:</b> {detail.employee.email ?? "-"}</div>
                              <div><b>Salariu:</b> {detail.employee.salary ?? "-"}</div>
                            </>
                          )}
                        </div>
                      )}

                      {showUpdateUserForm[u.id] && (
                        <div className="form-inline">
                          {/* EXISTENTE */}
                          <div className="form-row">
                            <label>Username</label>
                            <input
                              type="text"
                              value={editUsername[u.id] ?? u.username}
                              onChange={(e) =>
                                setEditUsername((prev) => ({ ...prev, [u.id]: e.target.value }))
                              }
                              disabled={isBusy}
                            />
                          </div>

                          <div className="form-row">
                            <label>Rol (admin / administrator / user)</label>
                            <input
                              type="text"
                              value={editRoleName[u.id] ?? (u.role ?? "")}
                              onChange={(e) =>
                                setEditRoleName((prev) => ({ ...prev, [u.id]: e.target.value }))
                              }
                              disabled={isBusy}
                            />
                          </div>

                          {/* ⇓ ADAUGĂ: TELEFON */}
                          <div className="form-row">
                            <label>Telefon</label>
                            <input
                              type="text"
                              value={editPhone[u.id] ?? ""}
                              onChange={(e) =>
                                setEditPhone((prev) => ({ ...prev, [u.id]: e.target.value }))
                              }
                              disabled={isBusy}
                            />
                          </div>

                          {/* ⇓ ADAUGĂ: EMAIL */}
                          <div className="form-row">
                            <label>Email</label>
                            <input
                              type="email"
                              value={editEmail[u.id] ?? ""}
                              onChange={(e) =>
                                setEditEmail((prev) => ({ ...prev, [u.id]: e.target.value }))
                              }
                              disabled={isBusy}
                            />
                          </div>

                          {/* ⇓ ADAUGĂ: SALARIU */}
                          <div className="form-row">
                            <label>Salariu</label>
                            <input
                              type="number"
                              value={editSalary[u.id] ?? ""}
                              onChange={(e) => {
                                const v = e.target.value;
                                setEditSalary((prev) => ({
                                  ...prev,
                                  [u.id]: v === "" ? null : Number(v),
                                }));
                              }}
                              disabled={isBusy}
                            />
                          </div>

                          <div className="form-actions">
                            <button onClick={() => onUpdateUser(u.id)} disabled={isBusy}>
                              Salvează
                            </button>
                            <button
                              className="secondary"
                              onClick={() =>
                                setShowUpdateUserForm((prev) => ({ ...prev, [u.id]: false }))
                              }
                              disabled={isBusy}
                            >
                              Anulează
                            </button>
                          </div>
                        </div>
                      )}

                      {showUpdatePasswordForm[u.id] && (
                        <div className="form-inline">
                          <div className="form-row">
                            <label>Parola nouă (min. 8)</label>
                            <input
                              type="password"
                              value={newPassword[u.id] ?? ""}
                              onChange={(e) =>
                                setNewPassword((prev) => ({ ...prev, [u.id]: e.target.value }))
                              }
                              disabled={isBusy}
                            />
                          </div>
                          <div className="form-actions">
                            <button onClick={() => onUpdatePassword(u.id)} disabled={isBusy}>
                              Schimbă parola
                            </button>
                            <button
                              className="secondary"
                              onClick={() =>
                                setShowUpdatePasswordForm((prev) => ({ ...prev, [u.id]: false }))
                              }
                              disabled={isBusy}
                            >
                              Anulează
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;
