
import React, { useEffect, useState } from "react";
import { addClient, type AddClientPayload } from "../services/clients";
import { getContactsList, type ContactOption } from "../services/contact";
import { getApiErrorMessage } from "../services/error";
import "../styles/global.css";
import "../styles/contact.css";

const AddClientPage: React.FC = () => {
  const [contacts, setContacts] = useState<ContactOption[]>([]);
  const [form, setForm] = useState<AddClientPayload>({
    name: "",
    contactId: 0,
    legalName: "",
    fiscalCode: "",
    country: "",
    currency: "",
    address: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await getContactsList();
        setContacts(list);
      } catch {
        setError("Nu pot încărca lista contactelor.");
      }
    };
    load();
  }, []);

  const updateField = <K extends keyof AddClientPayload>(
    key: K,
    value: AddClientPayload[K]
  ) => setForm(prev => ({ ...prev, [key]: value }));

  const onSubmit = async () => {
    setError(null);
    setSuccess(null);
    if (!form.name) return setError("Numele este obligatoriu.");
    if (!form.contactId || form.contactId === 0)
      return setError("Trebuie să alegi un contact.");

    try {
      setLoading(true);
      await addClient(form);
      setSuccess("Client adăugat cu succes!");
      setForm({ name: "", contactId: 0, legalName: "", fiscalCode: "", country: "", currency: "", address: "" });
    } catch (e) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="topbar">
        <h2 className="title">Adaugă Client</h2>
      </div>

      <div className="content">
        <div className="card-center contact-card">

          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}

          <div className="form-grid">
            <div className="form-row">
              <label>Nume*</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
              />
            </div>

            <div className="form-row">
              <label>Nume legal</label>
              <input
                type="text"
                value={form.legalName}
                onChange={(e) => updateField("legalName", e.target.value)}
              />
            </div>

            <div className="form-row">
              <label>CUI / Fiscal Code</label>
              <input
                type="text"
                value={form.fiscalCode}
                onChange={(e) => updateField("fiscalCode", e.target.value)}
              />
            </div>

            <div className="form-row">
              <label>Țara</label>
              <input
                type="text"
                value={form.country}
                onChange={(e) => updateField("country", e.target.value)}
              />
            </div>

            <div className="form-row">
              <label>Monedă</label>
              <input
                type="text"
                value={form.currency}
                onChange={(e) => updateField("currency", e.target.value)}
              />
            </div>

            <div className="form-row">
              <label>Adresă</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
              />
            </div>

            <div className="form-row">
              <label>Contact</label>
              <select
                value={form.contactId}
                onChange={(e) => updateField("contactId", Number(e.target.value))}
              >
                <option value={0}>Alege un contact</option>
                {contacts.map(c => (
                  <option key={c.Id} value={c.Id}>
                    {c.Name}
                  </option>
                ))}
              </select>
            </div>

          </div>

          <div className="form-actions">
            <button onClick={onSubmit} disabled={loading}>
              {loading ? "Salvez..." : "Salvează"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AddClientPage;
