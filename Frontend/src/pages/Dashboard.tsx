
import React from "react";
import { useAuth } from "../hooks/useAuth";
import "../styles/global.css";
import "../styles/dashboard.css";

//functia de permisiune pentru acces in pagina
const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const fullName = user ? `${user.firstName} ${user.lastName}` : "Utilizator";

  return (
    <div className="dashboard">
      <div className="topbar">
        <h2 className="title">{fullName}</h2>
        <button className="logout" onClick={logout}>Logout</button>
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
      </div>
    </div>
  );
};

export default Dashboard;
