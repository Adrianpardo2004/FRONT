import { useState, useEffect } from "react";
import axios from "axios";
import "./Login.css"; // reutiliza el estilo de Login

function CambiarPassword() {
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [tokenValido, setTokenValido] = useState(false);
  const [token, setToken] = useState("");

  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    // extraer token de la URL
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) {
      setToken(t);
      setTokenValido(true);
    } else {
      setMensaje("Token no válido o expirado");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (nuevaPassword !== confirmarPassword) {
      setMensaje("Las contraseñas no coinciden");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/api/auth/cambiar-password`, {
        token,
        nuevaPassword,
      });
      setMensaje(res.data.message);
      setTimeout(() => {
        window.location.href = "/"; // volver al login
      }, 2000);
    } catch (err) {
      setMensaje(err.response?.data?.message || "Error al cambiar contraseña");
    }
  };

  if (!tokenValido) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h2 className="login-title">Recuperación de contraseña</h2>
          <p>{mensaje || "Token inválido o expirado"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Cambiar contraseña</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Nueva contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={nuevaPassword}
              onChange={(e) => setNuevaPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Confirmar contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-login">
            Guardar nueva contraseña
          </button>
        </form>
        {mensaje && <p style={{ marginTop: "10px" }}>{mensaje}</p>}
      </div>
    </div>
  );
}

export default CambiarPassword;
