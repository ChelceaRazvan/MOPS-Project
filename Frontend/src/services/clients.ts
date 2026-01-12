import api from "./api";

export type AddClientPayload = {
  name: string;
  legalName?: string;
  fiscalCode?: string;
  country?: string;
  currency?: string;
  address?: string;
  contactId: number;
};


export async function addClient(payload: AddClientPayload) {
  const { data } = await api.post("/clients/", payload); // ← cu slash
  return data;
}



