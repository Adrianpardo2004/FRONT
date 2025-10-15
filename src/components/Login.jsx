import { useState } from "react";
import axios from "axios";
import "./Login.css";

function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        correo,
        password,
      });
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        window.location.href = "/dashboard";
      } else {
        alert("Correo o contraseña incorrecta");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error en login");
    } finally {
      setLoading(false);
    }
  };

  const handleRecuperar = async () => {
    if (!correo) {
      alert("Ingresa tu correo primero");
      return;
    }
    try {
      const res = await axios.post(`${API_URL}/api/auth/recuperar`, { correo });
      alert(res.data.message);
    } catch (err) {
      alert(err.response?.data?.message || "Error enviando correo");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Login RRHH</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Correo</label>
            <input
              type="email"
              placeholder="ejemplo@correo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <button className="btn-recuperar" onClick={handleRecuperar}>
          ¿Olvidaste tu contraseña?
        </button>
      </div>
    </div>
  );
}

export default Login;
