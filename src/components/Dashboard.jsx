import { useState } from "react";
import Empleados from "./Empleados";
import Contratos from "./Contratos";
import "./Dashboard.css";

function Dashboard() {
  const [view, setView] = useState("empleados");

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Interfaz RRHH</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </header>

      <nav className="nav-tabs">
        <button
          className={view === "empleados" ? "active" : ""}
          onClick={() => setView("empleados")}
        >
          Empleados
        </button>
        <button
          className={view === "contratos" ? "active" : ""}
          onClick={() => setView("contratos")}
        >
          Contratos
        </button>
      </nav>

      <main className="dashboard-content">
        {view === "empleados" && <Empleados />}
        {view === "contratos" && <Contratos />}
      </main>
    </div>
  );
}

export default Dashboard;
