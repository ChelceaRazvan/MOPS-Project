import { useState } from "react";
import "./index.css";

const API = "http://127.0.0.1:8000";

const endpoints = {
  invoice: {
    title: "Create Invoice (Transaction)",
    url: "/invoices",
    payload: {
      user_id: "",
      invoice_number: "",
      invoice_date: "",
      payment_terms: "",
      due_date: "",
      order_id: "",
      notes: ""
    }
  },

  directInvoice: {
    title: "Create Direct Invoice",
    url: "/direct_invoices",
    payload: {
      user_id: "",
      invoice_number: "",
      invoice_date: "",
      invoice_type: "",
      supplier_id: "",
      currency_code: "",
      exchange_rate: "",
      payment_terms: "",
      due_date: "",
      notes: "",
      items: []
    }
  },

  nir: {
    title: "Create NIR From Invoice",
    url: "/nir_from_invoice",
    payload: {
      user_id: "",
      invoice_id: "",
      nir_number: "",
      nir_date: "",
      items: []
    }
  },

  order: {
    title: "Create Order",
    url: "/orders",
    payload: {
      user_id: "",
      document_type: "",
      order_number: "",
      order_date: "",
      order_type: "",
      suplier_id: "",
      client_id: "",
      currency_code: "",
      exchange_rate: "",
      shipping_address: "",
      notes: "",
      items: []
    }
  }
};

export default function App() {
  const [active, setActive] = useState(null);
  const [data, setData] = useState({});
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const open = (key) => {
    setActive(key);
    setData(JSON.parse(JSON.stringify(endpoints[key].payload)));
    setResponse(null);
  };

  const update = (k, v) =>
    setData((p) => ({ ...p, [k]: v }));

  const send = async () => {
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch(API + endpoints[active].url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const text = await res.text();
      setResponse(text);
    } catch (e) {
      setResponse("FETCH ERROR: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>ERP API Tester</h1>

      <div className="buttons">
        <button onClick={() => open("invoice")}>Invoice</button>
        <button onClick={() => open("directInvoice")}>Direct Invoice</button>
        <button onClick={() => open("nir")}>NIR</button>
        <button onClick={() => open("order")}>Order</button>
      </div>

      {active && (
        <div className="overlay">
          <div className="modal">
            <h2>{endpoints[active].title}</h2>

            {Object.keys(data).map((k) =>
              k === "items" ? (
                <small key={k}>items se trimit din backend test</small>
              ) : (
                <label key={k}>
                  {k}
                  <input
                    value={data[k]}
                    onChange={(e) =>
                      update(k, e.target.value)
                    }
                  />
                </label>
              )
            )}

            <div className="actions">
              <button onClick={send} disabled={loading}>
                {loading ? "Sending..." : "Send"}
              </button>
              <button onClick={() => setActive(null)}>
                Close
              </button>
            </div>

            {response && (
              <pre className="response">{response}</pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
