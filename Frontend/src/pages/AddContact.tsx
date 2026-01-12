
import React, { useState } from "react";
import { addContact, type AddContactPayload } from "../services/contact";
import { getApiErrorMessage } from "../services/error";
import "../styles/global.css";
import "../styles/contact.css";

const AddContactPage: React.FC = () => {
  const [form, setForm] = useState<AddContactPayload>({
    name: "",
    address: "",
    phone: "",
    email: "",
    type: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const updateField = <K extends keyof AddContactPayload>(key: K, value: AddContactPayload[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const onSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (!form.name || form.name.trim().length === 0) {
        setError("Numele este obligatoriu.");
        return;
      }
      // Email simplu validat de input type="email" la nivel de UI; backend are EmailStr
      const res = await addContact(form);
      setSuccess(`Contact adăugat (#${res.Id})`);
      setForm({ name: "", address: "", phone: "", email: "", type: "" });
    } catch (e: unknown) {
      setError(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="topbar">
        <h2 className="title">Adaugă Contact</h2>
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
                placeholder="Ex: John Doe"
              />
            </div>

            <div className="form-row">
              <label>Adresă</label>
              <input
                type="text"
                value={form.address ?? ""}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="Strada Exemplu 123"
              />
            </div>

            <div className="form-row">
              <label>Telefon</label>
              <input
                type="text"
                value={form.phone ?? ""}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="+40 7xx xxx xxx"
              />
            </div>

            <div className="form-row">
              <label>Email</label>
              <input
                type="email"
                value={form.email ?? ""}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="exemplu@domeniu.ro"
              />
            </div>

            <div className="form-row">
              <label>Tip</label>
              <input
                type="text"
                value={form.type ?? ""}
                onChange={(e) => updateField("type", e.target.value)}
                placeholder="client / furnizor / partener"
              />
            </div>
          </div>

          <div className="form-actions">
            <button onClick={onSubmit} disabled={loading}>
              {loading ? "Se salvează..." : "Salvează"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddContactPage;
