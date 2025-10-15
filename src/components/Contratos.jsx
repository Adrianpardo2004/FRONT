import { useState, useEffect } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

function Contratos() {
  const [contratos, setContratos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [form, setForm] = useState({
    empleado_id: "",
    fecha_inicio: "",
    fecha_fin: "",
    valor: "",
    cargo: "",
    observacion: "", // ✅ Nuevo campo
  });
  const [editingId, setEditingId] = useState(null);

  // Obtener contratos y empleados
  const fetchContratos = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/contratos`);
      setContratos(res.data);
    } catch (err) {
      console.error("Error al obtener contratos:", err);
    }
  };

  const fetchEmpleados = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/empleados`);
      setEmpleados(res.data);
    } catch (err) {
      console.error("Error al obtener empleados:", err);
    }
  };

  useEffect(() => {
    fetchContratos();
    fetchEmpleados();
  }, []);

  // Crear o actualizar contrato
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/api/contratos/${editingId}`, form);
      } else {
        await axios.post(`${API_URL}/api/contratos`, form);
      }
      setForm({
        empleado_id: "",
        fecha_inicio: "",
        fecha_fin: "",
        valor: "",
        cargo: "",
        observacion: "",
      });
      setEditingId(null);
      fetchContratos();
    } catch (err) {
      console.error("Error al guardar contrato:", err);
    }
  };

  // Exportar PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Contratos SIRH Molino", 10, 10);
    let row = 20;
    contratos.forEach((c) => {
      doc.text(
        `${c.empleado_id?.nombre || "N/A"} - ${c.cargo || "N/A"} - ${new Date(
          c.fecha_inicio
        ).toLocaleDateString()} / ${new Date(
          c.fecha_fin
        ).toLocaleDateString()} - $${c.valor} - Obs: ${c.observacion || "N/A"}`,
        10,
        row
      );
      row += 10;
    });
    doc.save("contratos.pdf");
  };

  // Exportar Excel
  const exportExcel = () => {
    const dataExcel = contratos.map((c) => ({
      Empleado: c.empleado_id?.nombre || "N/A",
      Cargo: c.cargo || "N/A",
      Fecha_Inicio: new Date(c.fecha_inicio).toLocaleDateString(),
      Fecha_Fin: new Date(c.fecha_fin).toLocaleDateString(),
      Valor: c.valor,
      Observacion: c.observacion || "", // ✅ Incluimos observación
    }));
    const ws = XLSX.utils.json_to_sheet(dataExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Contratos");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "contratos.xlsx");
  };

  const handleEdit = (c) => {
    setForm({
      empleado_id: c.empleado_id._id,
      fecha_inicio: c.fecha_inicio.slice(0, 10),
      fecha_fin: c.fecha_fin.slice(0, 10),
      valor: c.valor,
      cargo: c.cargo || "",
      observacion: c.observacion || "", // ✅ Editar observación
    });
    setEditingId(c._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Eliminar contrato?")) {
      await axios.delete(`${API_URL}/api/contratos/${id}`);
      fetchContratos();
    }
  };

  return (
    <div className="contratos-container">
      <h2>Contratos</h2>
      <h3>{editingId ? "Editar contrato" : "Crear contrato"}</h3>

      <form onSubmit={handleSubmit} className="contrato-form">
        <select
          value={form.empleado_id}
          onChange={(e) => setForm({ ...form, empleado_id: e.target.value })}
          required
        >
          <option value="">Seleccione empleado</option>
          {empleados.map((emp) => (
            <option key={emp._id} value={emp._id}>
              {emp.nombre} {emp.apellido}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Cargo"
          value={form.cargo}
          onChange={(e) => setForm({ ...form, cargo: e.target.value })}
          required
        />

        <textarea
          placeholder="Observación"
          value={form.observacion}
          onChange={(e) => setForm({ ...form, observacion: e.target.value })}
          rows="2"
          style={{ resize: "none" }}
        />

        <input
          type="date"
          value={form.fecha_inicio}
          onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
          required
        />
        <input
          type="date"
          value={form.fecha_fin}
          onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Valor"
          value={form.valor}
          onChange={(e) => setForm({ ...form, valor: e.target.value })}
          required
        />
        <button type="submit">{editingId ? "Actualizar" : "Crear"}</button>
      </form>

      <table className="tabla-contratos">
        <thead>
          <tr>
            <th>Empleado</th>
            <th>Cargo</th>
            <th>Fecha Inicio</th>
            <th>Fecha Fin</th>
            <th>Valor</th>
            <th>Observación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {contratos.map((c) => (
            <tr key={c._id}>
              <td>{c.empleado_id?.nombre || "N/A"}</td>
              <td>{c.cargo || "N/A"}</td>
              <td>{new Date(c.fecha_inicio).toLocaleDateString()}</td>
              <td>{new Date(c.fecha_fin).toLocaleDateString()}</td>
              <td>{c.valor}</td>
              <td>{c.observacion || "-"}</td>
              <td>
                <button onClick={() => handleEdit(c)}>Editar</button>
                <button onClick={() => handleDelete(c._id)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="export-buttons">
        <button onClick={exportPDF}>Exportar PDF</button>
        <button onClick={exportExcel}>Exportar Excel</button>
      </div>
    </div>
  );
}

export default Contratos;
