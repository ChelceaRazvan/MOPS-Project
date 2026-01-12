import api from "./api";

export type AddContactPayload = {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  type?: string;
};

export type ContactResponse = {
  Id: number;
  Name: string;
  Address?: string | null;
  Phone?: string | null;
  Email?: string | null;
  Type?: string | null;
};

export async function addContact(payload: AddContactPayload): Promise<ContactResponse> {
  const { data } = await api.post<ContactResponse>("/contacts", payload);
  return data;
}


export type ContactDto = {
  Id: number;
  Name: string;
  Address?: string | null;
  Phone?: string | null;
  Email?: string | null;
  Type?: string | null;
};


export type ContactOption = {
  Id: number;
  Name: string;
};

export async function getContactsList(): Promise<ContactOption[]> {
  // Tipăm răspunsul lui api.get ca array de ContactDto
  const { data } = await api.get<ContactDto[]>("/contacts");
  // Mapare strictă, fără any
  return (data ?? []).map((c): ContactOption => ({
    Id: c.Id,
    Name: c.Name,
  }));
}



