import { useState } from "react";
import "../styles/SuppliersPage.css";

interface Contact {
  Name: string;
  Address?: string;
  Phone?: string;
  Email?: string;
  Type: number;
}

interface Supplier {
  Name: string;
  LegalName?: string;
  Fiscal_Code?: string;
  Country?: string;
  IBAN?: string;
  Currency?: string;
  Address?: string;
  contact: Contact;
}

export default function AddSupplierPage() {
  const [supplier, setSupplier] = useState<Supplier>({
    Name: "",
    LegalName: "",
    Fiscal_Code: "",
    Country: "",
    IBAN: "",
    Currency: "",
    Address: "",
    contact: {
      Name: "",
      Address: "",
      Phone: "",
      Email: "",
      Type: 1,
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (field: string, value: string) => {
    setSupplier((prev) => ({ ...prev, [field]: value }));
  };

  const handleContactChange = (field: string, value: string | number) => {
    setSupplier((prev) => ({
      ...prev,
      contact: { ...prev.contact, [field]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("http://127.0.0.1:8000/suppliers/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(supplier),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to add supplier");
      }

      setSuccess(true);
      setSupplier({
        Name: "",
        LegalName: "",
        Fiscal_Code: "",
        Country: "",
        IBAN: "",
        Currency: "",
        Address: "",
        contact: { Name: "", Address: "", Phone: "", Email: "", Type: 1 },
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Input styling
  const inputStyle: React.CSSProperties = {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid var(--border)",
    background: "var(--card)",
    color: "var(--text)",
    fontSize: 14,
    width: "100%",
  };

  const labelStyle: React.CSSProperties = {
    marginBottom: 4,
    fontWeight: 600,
  };

  return (
    <div className="dashboard">
      <header className="topbar">
        <h1 className="title">Add Supplier</h1>
      </header>

      <main className="content">
        <div className="card" style={{ maxWidth: 700, width: "100%" }}>
          {error && <div style={{ color: "#f87171", marginBottom: 12 }}>{error}</div>}
          {success && <div style={{ color: "#22c55e", marginBottom: 12 }}>Supplier added successfully!</div>}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Supplier fields */}
            <div>
              <label style={labelStyle}>Name *</label>
              <input
                type="text"
                value={supplier.Name}
                onChange={(e) => handleChange("Name", e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Legal Name</label>
              <input
                type="text"
                value={supplier.LegalName}
                onChange={(e) => handleChange("LegalName", e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Fiscal Code</label>
              <input
                type="text"
                value={supplier.Fiscal_Code}
                onChange={(e) => handleChange("Fiscal_Code", e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Country</label>
              <input
                type="text"
                value={supplier.Country}
                onChange={(e) => handleChange("Country", e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>IBAN</label>
              <input
                type="text"
                value={supplier.IBAN}
                onChange={(e) => handleChange("IBAN", e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Currency</label>
              <input
                type="text"
                value={supplier.Currency}
                onChange={(e) => handleChange("Currency", e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Address</label>
              <input
                type="text"
                value={supplier.Address}
                onChange={(e) => handleChange("Address", e.target.value)}
                style={inputStyle}
              />
            </div>

            {/* Contact fields */}
            <h3 style={{ marginTop: 16, fontWeight: 700 }}>Contact</h3>

            <div>
              <label style={labelStyle}>Name *</label>
              <input
                type="text"
                value={supplier.contact.Name}
                onChange={(e) => handleContactChange("Name", e.target.value)}
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Address</label>
              <input
                type="text"
                value={supplier.contact.Address}
                onChange={(e) => handleContactChange("Address", e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Phone</label>
              <input
                type="text"
                value={supplier.contact.Phone}
                onChange={(e) => handleContactChange("Phone", e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={supplier.contact.Email}
                onChange={(e) => handleContactChange("Email", e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Type</label>
              <select
                value={supplier.contact.Type}
                onChange={(e) => handleContactChange("Type", Number(e.target.value))}
                style={inputStyle}
              >
                <option value={1}>Supplier</option>
                <option value={2}>Client</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 16,
                padding: "12px 20px",
                borderRadius: 10,
                border: "none",
                background: "linear-gradient(90deg, var(--accent), var(--accent-2))",
                color: "white",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {loading ? "Saving..." : "Add Supplier"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}