import { useState, useEffect } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./Dashboard.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

function Empleados() {
  const [empleados, setEmpleados] = useState([]);
  const [q, setQ] = useState("");
  const [form, setForm] = useState({
    nro_documento: "",
    nombre: "",
    apellido: "",
    edad: "",
    genero: "",
    cargo: "",
    estado: "activo",
    correo: "",
    password: "",
  });
  const [editingId, setEditingId] = useState(null);

  // Obtener empleados
  const fetchEmpleados = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/empleados`);
      setEmpleados(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchEmpleados();
  }, []);

  // Validación: impedir enviar si todo es 0 o edad fuera de rango
  const validarCampos = () => {
    const valores = Object.values(form).map((v) => v.toString().trim());
    const todosCero = valores.every((v) => v === "0" || v === "");
    if (todosCero) {
      alert("❌ No puedes ingresar todos los campos en cero o vacíos.");
      return false;
    }

    // Validar edad entre 18 y 100
    const edad = parseInt(form.edad);
    if (isNaN(edad) || edad < 18 || edad > 100) {
      alert("❌ La edad debe estar entre 18 y 100 años.");
      return false;
    }

    return true;
  };

  // Crear o actualizar empleado
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarCampos()) return;

    try {
      if (editingId) {
        await axios.put(`${API_URL}/api/empleados/${editingId}`, form);
      } else {
        await axios.post(`${API_URL}/api/empleados`, form);
      }

      setForm({
        nro_documento: "",
        nombre: "",
        apellido: "",
        edad: "",
        genero: "",
        cargo: "",
        estado: "activo",
        correo: "",
        password: "",
      });
      setEditingId(null);
      fetchEmpleados();
    } catch (err) {
      console.log(err);
      alert("⚠️ Error al guardar el empleado.");
    }
  };

  // Buscar empleado
  const handleBuscar = async () => {
    if (!q.trim()) {
      alert("Ingresa un nombre o número de documento para buscar.");
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/api/empleados/buscar?q=${q}`);
      alert(
        `Empleado: ${res.data.empleado.nombre} ${res.data.empleado.apellido}\nContratos: ${res.data.cantidad_contratos}`
      );
    } catch (err) {
      alert("Empleado no encontrado");
    }
  };

  // Editar
  const handleEdit = (empleado) => {
    setForm({
      nro_documento: empleado.nro_documento,
      nombre: empleado.nombre,
      apellido: empleado.apellido,
      edad: empleado.edad || "",
      genero: empleado.genero || "",
      cargo: empleado.cargo,
      estado: empleado.estado,
      correo: empleado.correo,
      password: empleado.password,
    });
    setEditingId(empleado._id);
  };

  // Eliminar
  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar empleado y sus contratos?")) {
      await axios.delete(`${API_URL}/api/empleados/${id}`);
      fetchEmpleados();
    }
  };

  // Exportar PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Empleados SIRH Molino", 10, 10);
    let row = 20;
    empleados.forEach((e) => {
      doc.text(
        `${e.nro_documento} - ${e.nombre} ${e.apellido} - ${e.edad || "-"} años - ${e.genero || "-"} - ${e.cargo} - ${e.estado}`,
        10,
        row
      );
      row += 10;
    });
    doc.save("empleados.pdf");
  };

  // Exportar Excel
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(empleados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Empleados");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "empleados.xlsx");
  };

  return (
    <div className="section-container">
      <h2>Gestión de Empleados</h2>

      {/* Barra de búsqueda */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar por nombre o documento..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button onClick={handleBuscar}>Buscar</button>
      </div>

      {/* Formulario */}
      <h3>{editingId ? "Editar empleado" : "Crear empleado"}</h3>
      <form className="data-form" onSubmit={handleSubmit}>
        <input
          placeholder="Documento"
          value={form.nro_documento}
          onChange={(e) => setForm({ ...form, nro_documento: e.target.value })}
          required
        />
        <input
          placeholder="Nombre"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          required
        />
        <input
          placeholder="Apellido"
          value={form.apellido}
          onChange={(e) => setForm({ ...form, apellido: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Edad (18-100)"
          value={form.edad}
          onChange={(e) => setForm({ ...form, edad: e.target.value })}
          required
          min="18"
          max="100"
        />
        <select
          value={form.genero}
          onChange={(e) => setForm({ ...form, genero: e.target.value })}
          required
        >
          <option value="">Género</option>
          <option value="Masculino">Masculino</option>
          <option value="Femenino">Femenino</option>
          <option value="Otro">Otro</option>
        </select>
        <input
          placeholder="Cargo"
          value={form.cargo}
          onChange={(e) => setForm({ ...form, cargo: e.target.value })}
        />
        <input
          type="email"
          placeholder="Correo"
          value={form.correo}
          onChange={(e) => setForm({ ...form, correo: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <select
          value={form.estado}
          onChange={(e) => setForm({ ...form, estado: e.target.value })}
        >
          <option value="activo">Activo</option>
          <option value="retirado">Retirado</option>
        </select>
        <button type="submit">{editingId ? "Actualizar" : "Crear"}</button>
      </form>

      {/* Tabla */}
      <table className="data-table">
        <thead>
          <tr>
            <th>Documento</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Edad</th>
            <th>Género</th>
            <th>Cargo</th>
            <th>Correo</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {empleados.map((e) => (
            <tr key={e._id}>
              <td>{e.nro_documento}</td>
              <td>{e.nombre}</td>
              <td>{e.apellido}</td>
              <td>{e.edad || "-"}</td>
              <td>{e.genero || "-"}</td>
              <td>{e.cargo}</td>
              <td>{e.correo}</td>
              <td>{e.estado}</td>
              <td>
                <button className="edit-btn" onClick={() => handleEdit(e)}>
                  ✏️
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(e._id)}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Exportar */}
      <div className="export-buttons">
        <button onClick={exportPDF}>📄 Exportar PDF</button>
        <button onClick={exportExcel}>📊 Exportar Excel</button>
      </div>
    </div>
  );
}

export default Empleados;
