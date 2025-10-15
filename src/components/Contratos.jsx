import { useState, useEffect } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// ✅ URL del backend (Render en producción o localhost en desarrollo)
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
  });
  const [editingId, setEditingId] = useState(null);

  // 📦 Obtener contratos y empleados
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

  // 📝 Crear o actualizar contrato
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
      });
      setEditingId(null);
      fetchContratos();
    } catch (err) {
      console.error("Error al guardar contrato:", err);
    }
  };

  // 🧾 Exportar PDF
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
        ).toLocaleDateString()} - $${c.valor}`,
        10,
        row
      );
      row += 10;
    });
    doc.save("contratos.pdf");
  };

  // 📊 Exportar Excel
  const exportExcel = () => {
    const dataExcel = contratos.map((c) => ({
      Empleado: c.empleado_id?.nombre || "N/A",
      Cargo: c.cargo || "N/A",
      Fecha_Inicio: new Date(c.fecha_inicio).toLocaleDateString(),
      Fecha_Fin: new Date(c.fecha_fin).toLocaleDateString(),
      Valor: c.valor,
    }));
    const ws = XLSX.utils.json_to_sheet(dataExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Contratos");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "contratos.xlsx");
  };

  // ✏️ Editar contrato
  const handleEdit = (c) => {
    setForm({
      empleado_id: c.empleado_id._id,
      fecha_inicio: c.fecha_inicio.slice(0, 10),
      fecha_fin: c.fecha_fin.slice(0, 10),
      valor: c.valor,
      cargo: c.cargo || "",
    });
    setEditingId(c._id);
  };

  // 🗑️ Eliminar contrato
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

      <style>{`
        .contratos-container {
          padding: 20px;
          background: #f8f9fa;
          border-radius: 10px;
          max-width: 900px;
          margin: 0 auto;
        }
        .contrato-form {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 15px;
        }
        .contrato-form input, 
        .contrato-form select {
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 5px;
          flex: 1;
          min-width: 150px;
        }
        .contrato-form button {
          background: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          padding: 8px 12px;
          cursor: pointer;
        }
        .contrato-form button:hover {
          background: #0056b3;
        }
        .tabla-contratos {
          width: 100%;
          border-collapse: collapse;
          margin-top: 15px;
        }
        .tabla-contratos th, 
        .tabla-contratos td {
          border: 1px solid #ccc;
          padding: 8px;
          text-align: center;
        }
        .tabla-contratos th {
          background-color: #007bff;
          color: white;
        }
        .tabla-contratos tr:nth-child(even) {
          background: #f2f2f2;
        }
        .export-buttons {
          margin-top: 15px;
          display: flex;
          gap: 10px;
        }
        .export-buttons button {
          background: #28a745;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 5px;
          cursor: pointer;
        }
        .export-buttons button:hover {
          background: #218838;
        }
      `}</style>
    </div>
  );
}

export default Contratos;
