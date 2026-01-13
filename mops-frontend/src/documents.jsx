import { useState } from "react";
import "./index.css";

/* =======================
   TYPES
======================= */

type EndpointKey = "invoice" | "directInvoice" | "nir" | "order";

type EndpointConfig = {
  title: string;
  url: string;
  payload: Record<string, any>;
};

type EndpointsMap = Record<EndpointKey, EndpointConfig>;

/* =======================
   CONFIG
======================= */

const API = "http://127.0.0.1:8000";

const endpoints: EndpointsMap = {
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
      client_id: "",
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

/* =======================
   COMPONENT
======================= */

export default function ApiTester() {
  const [active, setActive] = useState<EndpointKey | null>(null);
  const [data, setData] = useState<Record<string, any>>({});
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const open = (key: EndpointKey) => {
    setActive(key);
    setData(structuredClone(endpoints[key].payload));
    setResponse(null);
  };

  const update = (key: string, value: string) => {
    setData((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const send = async () => {
    if (!active) return;

    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch(API + endpoints[active].url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const text = await res.text();
      setResponse(text);
    } catch (err) {
      setResponse(
        err instanceof Error
          ? "FETCH ERROR: " + err.message
          : "FETCH ERROR"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1>ERP API Tester</h1>

      <div className="buttons">
        <button onClick={() => open("invoice")}>Invoice</button>
        <button onClick={() => open("directInvoice")}>
          Direct Invoice
        </button>
        <button onClick={() => open("nir")}>NIR</button>
        <button onClick={() => open("order")}>Order</button>
      </div>

      {active && (
        <div className="overlay">
          <div className="modal">
            <h2>{endpoints[active].title}</h2>

            {Object.keys(data).map((key) =>
              key === "items" ? (
                <small key={key}>
                  items se trimit separat (test backend)
                </small>
              ) : (
                <label key={key}>
                  {key}
                  <input
                    value={data[key] ?? ""}
                    onChange={(e) =>
                      update(key, e.target.value)
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
