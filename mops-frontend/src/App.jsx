import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = "http://127.0.0.1:8000";

export default function App() {
  const [activeModal, setActiveModal] = useState(null);
  const [db, setDb] = useState({ suppliers: [], items: [], clients: [], orders: [], invoices: [] });

  // Încărcare liste la pornire
  useEffect(() => {
    const load = async () => {
      try {
        const [s, i, c, o, inv] = await Promise.all([
          axios.get(`${API}/get-list/suppliers`),
          axios.get(`${API}/get-list/items`),
          axios.get(`${API}/get-list/clients`),
          axios.get(`${API}/get-list/orders`),
          axios.get(`${API}/get-list/invoices`)
        ]);
        setDb({ suppliers: s.data, items: i.data, clients: c.data, orders: o.data, invoices: inv.data });
        console.log("Date încărcate din SQL:", s.data); // Verifică în Consola Browserului (F12)
      } catch (e) { console.error("Eroare conectare backend!"); }
    };
    load();
  }, []);

  const runPost = async (url, data) => {
    try {
      await axios.post(`${API}${url}`, data);
      alert("Succes! Tranzacție SQL finalizată.");
      setActiveModal(null);
    } catch (e) { alert("Eroare: " + (e.response?.data?.detail || e.message)); }
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white p-12 flex flex-col items-center font-sans">
      <h1 className="text-3xl font-black mb-12 italic uppercase tracking-widest">MOPS ERP CONTROL</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        <button onClick={() => setActiveModal('ORD')} className="card">Comandă</button>
        <button onClick={() => setActiveModal('INV_DIR')} className="card">Factură Directă</button>
        <button onClick={() => setActiveModal('INV_LINK')} className="card">Factură din Comandă</button>
        <button onClick={() => setActiveModal('NIR')} className="card">Generare NIR</button>
      </div>

      {/* 1. MODAL COMANDA (suplier_id, qtty) */}
      <Modal isOpen={activeModal === 'ORD'} title="create_order" onClose={() => setActiveModal(null)}>
        <form onSubmit={e => {
          e.preventDefault(); const d = new FormData(e.target);
          runPost('/orders/', {
            user_id: 1, document_type: "Achizitie", order_number: d.get('n'), order_date: d.get('dt'),
            order_type: 1, suplier_id: parseInt(d.get('s')), client_id: 1, currency_code: "RON", exchange_rate: 1.0,
            items: [{ item_id: parseInt(d.get('i')), qtty: parseFloat(d.get('q')), unit_price: parseFloat(d.get('p')), tax_rate: 19 }]
          });
        }}>
          <Input label="Order #" name="n" />
          <Input label="Data" name="dt" type="date" />
          <Select label="Furnizor" name="s" options={db.suppliers} />
          <Select label="Produs" name="i" options={db.items} />
          <div className="flex gap-4">
            <Input label="Cantitate (qtty)" name="q" type="number" />
            <Input label="Preț" name="p" type="number" />
          </div>
          <SubmitBtn />
        </form>
      </Modal>

      {/* 2. MODAL FACTURA DIN COMANDA (Reparat!) */}
      <Modal isOpen={activeModal === 'INV_LINK'} title="create_invoice_transaction" onClose={() => setActiveModal(null)}>
        <form onSubmit={e => {
          e.preventDefault(); const d = new FormData(e.target);
          runPost('/invoices/transaction', {
            user_id: 1, invoice_number: d.get('n'), invoice_date: d.get('dt'),
            payment_terms: "Cash", due_date: d.get('dt'), order_id: parseInt(d.get('o')), notes: ""
          });
        }}>
          <Select label="Comandă Sursă" name="o" options={db.orders} />
          <Input label="Număr Factură Nouă" name="n" />
          <Input label="Data" name="dt" type="date" />
          <SubmitBtn />
        </form>
      </Modal>

      {/* 3. MODAL NIR (quantity_received) */}
      <Modal isOpen={activeModal === 'NIR'} title="create_nir_from_invoice" onClose={() => setActiveModal(null)}>
        <form onSubmit={e => {
          e.preventDefault(); const d = new FormData(e.target);
          runPost('/nirs/from-invoice', {
            user_id: 1, invoice_id: parseInt(d.get('inv')), nir_number: d.get('n'), nir_date: d.get('dt'),
            items: [{ invoice_detail_id: parseInt(d.get('det')), quantity_received: parseFloat(d.get('q')) }]
          });
        }}>
          <Select label="Din Factura" name="inv" options={db.invoices} />
          <Input label="NIR #" name="n" />
          <Input label="ID Linie Factură" name="det" type="number" />
          <Input label="Cantitate (quantity_received)" name="q" type="number" />
          <SubmitBtn />
        </form>
      </Modal>
    </div>
  );
}

// COMPONENTE UI
function Modal({ isOpen, title, onClose, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-50 p-4">
      <div className="bg-[#111622] border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex justify-between">
          <h2 className="font-bold">{title}</h2>
          <button onClick={onClose} className="text-2xl">&times;</button>
        </div>
        <div className="p-8">{children}</div>
      </div>
    </div>
  );
}

function Select({ label, name, options }) {
  return (
    <div className="mb-4">
      <label className="text-[10px] text-slate-500 font-bold uppercase">{label}</label>
      <select name={name} className="w-full bg-[#0B0F1A] border border-slate-700 rounded p-3 text-sm focus:border-blue-500 outline-none mt-1">
        <option value="">-- Alege --</option>
        {options.map(o => <option key={o.Id} value={o.Id}>{o.Name}</option>)}
      </select>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div className="mb-4 flex-1">
      <label className="text-[10px] text-slate-500 font-bold uppercase">{label}</label>
      <input {...props} className="w-full bg-[#0B0F1A] border border-slate-700 rounded p-3 text-sm focus:border-blue-500 outline-none mt-1" />
    </div>
  );
}

function SubmitBtn() {
  return <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-cyan-400 text-black font-black py-4 rounded-xl mt-4 shadow-lg uppercase">Execută</button>;
}