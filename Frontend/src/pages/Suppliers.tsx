import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../styles/SuppliersPage.css";

interface Contact {
  Id: number;
  Name: string;
  Address?: string;
  Phone?: string;
  Email?: string;
  Type: number;
}

interface Supplier {
  Id?: number;
  Name: string;
  LegalName?: string;
  Fiscal_Code?: string;
  Country?: string;
  IBAN?: string;
  Currency?: string;
  Address?: string;
  Contact_Id?: number;
  contact?: Contact; // embedded contact
}

export default function SuppliersPage() {
    
    const navigate = useNavigate();

    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


   // Fetch contacts
    useEffect(() => {
        fetch("http://127.0.0.1:8000/contacts/all")
        .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch contacts");
            return res.json();
        })
        .then(setContacts)
        .catch((err) => setError(err.message));
    }, []);

    // Fetch suppliers
    useEffect(() => {
        fetch("http://127.0.0.1:8000/suppliers/all")
        .then((res) => {
            if (!res.ok) throw new Error("Failed to fetch suppliers");
            return res.json();
        })
        .then((suppliersData) => {
            // Merge contacts into suppliers
            const contactMap = new Map(contacts.map((c) => [c.Id, c]));
            const merged = suppliersData.map((s: Supplier) => ({
            ...s,
            contact: s.Contact_Id ? contactMap.get(s.Contact_Id) : undefined,
            }));
            setSuppliers(merged);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, [contacts]); // run when contacts are loaded

    return (
    <div className="dashboard">
      <header className="topbar">
        <h1 className="title">Suppliers</h1>
      </header>

      <main className="content">
        {loading && <div>Loading suppliers…</div>}
        {error && <div style={{ color: "#f87171" }}>{error}</div>}

        {!loading && !error && (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Legal Name</th>
                <th>Fiscal Code</th>
                <th>Country</th>
                <th>Currency</th>
                <th>IBAN</th>
                <th>Address</th>
                <th>Contact</th>
              </tr>
            </thead>

            <tbody>
              {suppliers.map((s, i) => (
                <tr key={s.Id ?? i}>
                  <td><strong>{s.Name}</strong></td>
                  <td>{s.LegalName ?? "-"}</td>
                  <td>{s.Fiscal_Code ?? "-"}</td>
                  <td>{s.Country ?? "-"}</td>
                  <td>{s.Currency ?? "-"}</td>
                  <td className="nowrap">{s.IBAN ?? "-"}</td>
                  <td className="truncate">{s.Address ?? "-"}</td>
                  <td>
                    {s.contact ? (
                      <div className="contact">
                        <div className="contact-name">{s.contact.Name}</div>
                        {s.contact.Email && <div className="contact-meta">{s.contact.Email}</div>}
                        {s.contact.Phone && <div className="contact-meta">{s.contact.Phone}</div>}
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <button
          onClick={() => navigate("/addSupplier")}
          style={{
            padding: "12px 20px",
            borderRadius: 10,
            border: "none",
            background: "linear-gradient(90deg, var(--accent), var(--accent-2))",
            color: "white",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Add Supplier
        </button>

      </main>
    </div>
  );

}
