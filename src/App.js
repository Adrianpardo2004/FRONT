import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import CambiarPassword from "./components/CambiarPassword";

function App() {
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        {/* 🔐 Siempre inicia en Login */}
        <Route path="/" element={<Login />} />

        {/* 📊 Dashboard solo accesible si hay token */}
        <Route
          path="/dashboard"
          element={isLoggedIn ? <Dashboard /> : <Login />}
        />

        {/* 🔄 Página para cambiar contraseña */}
        <Route path="/cambiar-password" element={<CambiarPassword />} />
      </Routes>
    </Router>
  );
}

export default App;
