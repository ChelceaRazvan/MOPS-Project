
import React from "react";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import "../styles/global.css";
import "../styles/dashboard.css";

//functia de permisiune pentru acces in pagina
const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const fullName = user ? `${user.firstName} ${user.lastName}` : "Utilizator";
  const role = (user?.role || "").trim().toLowerCase();
  const isAdmin = role === "admin" || role === "administrator";

  return (
    <div className="dashboard">
      
 <div className="topbar">
        <h2 className="title">{fullName}</h2>
        <div className="right-actions">
          {isAdmin && (
            <Link to="/admin/users" className="btn admin-btn">
              Admin
            </Link>
          )}
          <button className="logout" onClick={logout}>Logout</button>
        </div>
      </div>


      <div className="content">
        <div className="card-center">
          {user ? (
            <>
              <h3>Bun venit, {fullName}!</h3>
              <p>
                Username: <b>{user.username}</b> · Rol: <b>{user.role ?? "-"}</b>
              </p>
            </>
          ) : (
            <>
              <h3>Nu ești autentificat</h3>
              <p>Te rog să intri în cont pentru a accesa dashboard-ul.</p>
            </>
          )}
        </div>
        <div className="actions-under-card">
          <Link to="/add-contact" className="btn primary-btn">
            Adaugă Contact
          </Link>
          
            <Link to="/add-client" className="btn primary-btn">
               Adaugă Client
            </Link>
        </div>       
      </div> 
        <div style={{ display: "flex", gap: 16 }}>
          <button
            onClick={() => navigate("/suppliers")}
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
            To All Suppliers
          </button>

          <button
            onClick={() => navigate("/items")}
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
            To All Items
          </button>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
