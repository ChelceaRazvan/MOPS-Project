import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/SuppliersPage.css";

interface Supplier {
  Id: number;
  Name: string;
}

interface Item {
  Id: number;
  Supplier_Id: number;
  Name: string;
  Description?: string;
  Qtty: number;
  Sale_Price: number;
  Buy_Price: number;
  supplier?: Supplier; // embedded supplier
}


export default function ItemsPage() {
const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch suppliers
  useEffect(() => {
    fetch("http://127.0.0.1:8000/suppliers/all")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch suppliers");
        return res.json();
      })
      .then(setSuppliers)
      .catch((err) => setError(err.message));
  }, []);

  // Fetch items (after suppliers)
  useEffect(() => {
    if (suppliers.length === 0) return;

    fetch("http://127.0.0.1:8000/items/all")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch items");
        return res.json();
      })
      .then((itemsData: Item[]) => {
        const supplierMap = new Map(
          suppliers.map((s) => [s.Id, s])
        );

        const merged = itemsData.map((item) => ({
          ...item,
          supplier: supplierMap.get(item.Supplier_Id),
        }));

        setItems(merged);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [suppliers]);

    return (
    <div className="dashboard">
      <header className="topbar">
        <h1 className="title">Items</h1>
      </header>

      <main className="content">
        {loading && <div>Loading items…</div>}
        {error && <div style={{ color: "#f87171" }}>{error}</div>}

        {!loading && !error && (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Quantity</th>
                <th>Buy Price</th>
                <th>Sale Price</th>
                <th>Supplier</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item.Id}>
                  <td><strong>{item.Name}</strong></td>
                  <td className="truncate">{item.Description ?? "-"}</td>
                  <td
                    style={{
                      color: item.Qtty === 0 ? "#f87171" : undefined,
                      fontWeight: item.Qtty === 0 ? 600 : undefined,
                    }}
                  >
                    {item.Qtty}
                  </td>
                  <td>{item.Buy_Price.toFixed(2)}</td>
                  <td>{item.Sale_Price.toFixed(2)}</td>
                  <td>{item.supplier?.Name ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        <button
          onClick={() => navigate("/addItem")}
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
          Add Item
        </button>
        <button
            type="button"
            onClick={() => navigate("/dashboard")}
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
            Back to Dashboard
        </button>
      </main>
    </div>
  );
}

