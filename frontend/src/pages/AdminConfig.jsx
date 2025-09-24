import { useEffect, useState } from "react";
import API from "../api/axios";

export default function AdminConfig() {
  const [exchangeRate, setExchangeRate] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await API.get("/config", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setExchangeRate(res.data.exchangeRate);
      } catch (err) {
        console.error("❌ Error cargando config:", err.response?.data || err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put(
        "/config/",
        { exchangeRate },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setExchangeRate(res.data.exchangeRate);
      alert("💲 Cotización actualizada con éxito");
    } catch (err) {
      console.error("❌ Error guardando config:", err.response?.data || err);
    }
  };

  if (loading) return <p>Cargando...</p>;

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-6">
      <h2 className="text-xl font-bold mb-4">Configuración de dólar</h2>
      <form onSubmit={handleSave} className="flex items-center gap-4">
        <input
          type="number"
          step="0.01"
          value={exchangeRate}
          onChange={(e) => setExchangeRate(Number(e.target.value))}
          className="border p-2 rounded w-40"
        />
        <button
          type="submit"
          className="bg-ayp text-white px-4 py-2 rounded hover:bg-ayp-dark"
        >
          Guardar
        </button>
      </form>
    </div>
  );
}
