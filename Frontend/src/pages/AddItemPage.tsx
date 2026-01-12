import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SuppliersPage.css";

interface Supplier {
  Id: number;
  Name: string;
}

interface Item {
  Supplier_Id: number;
  Name: string;
  Description?: string;
  Sale_Price: number | "";
  Buy_Price: number | "";
}

export default function AddItemPage() {
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [item, setItem] = useState<Item>({
    Supplier_Id: 0,
    Name: "",
    Description: "",
    Sale_Price: "",
    Buy_Price: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch suppliers for dropdown
  useEffect(() => {
    fetch("http://127.0.0.1:8000/suppliers/all")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch suppliers");
        return res.json();
      })
      .then(setSuppliers)
      .catch((err) => setError(err.message));
  }, []);

  const handleChange = (field: keyof Item, value: any) => {
    setItem((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        Supplier_Id: item.Supplier_Id,
        Name: item.Name,
        Description: item.Description || null,
        Sale_Price: Number(item.Sale_Price),
        Buy_Price: Number(item.Buy_Price),
      };

      const res = await fetch("http://127.0.0.1:8000/items/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to add item");
      }

      setSuccess(true);
      setItem({
        Supplier_Id: 0,
        Name: "",
        Description: "",
        Sale_Price: "",
        Buy_Price: "",
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Same styling as AddSupplierPage
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
        <h1 className="title">Add Item</h1>
      </header>

      <main className="content">
        <div className="card" style={{ maxWidth: 600, width: "100%" }}>
          {error && (
            <div style={{ color: "#f87171", marginBottom: 12 }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ color: "#22c55e", marginBottom: 12 }}>
              Item added successfully!
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <div>
              <label style={labelStyle}>Supplier *</label>
              <select
                required
                value={item.Supplier_Id || ""}
                onChange={(e) =>
                  handleChange("Supplier_Id", Number(e.target.value))
                }
                style={inputStyle}
              >
                <option value="">Select supplier</option>
                {suppliers.map((s) => (
                  <option key={s.Id} value={s.Id}>
                    {s.Name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Item Name *</label>
              <input
                type="text"
                required
                value={item.Name}
                onChange={(e) => handleChange("Name", e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Description</label>
              <input
                type="text"
                value={item.Description}
                onChange={(e) => handleChange("Description", e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Buy Price *</label>
              <input
                type="number"
                step="0.01"
                required
                value={item.Buy_Price}
                onChange={(e) => handleChange("Buy_Price", e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Sale Price *</label>
              <input
                type="number"
                step="0.01"
                required
                value={item.Sale_Price}
                onChange={(e) => handleChange("Sale_Price", e.target.value)}
                style={inputStyle}
              />
            </div>

            <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "12px 20px",
                  borderRadius: 10,
                  border: "none",
                  background:
                    "linear-gradient(90deg, var(--accent), var(--accent-2))",
                  color: "white",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {loading ? "Saving..." : "Add Item"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/items")}
                style={{
                  padding: "12px 20px",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  background: "transparent",
                  color: "var(--text)",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
