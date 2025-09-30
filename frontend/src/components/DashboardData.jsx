import { useEffect, useState } from "react";
import axios from "../api/axios";

export default function DashboardData() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  if (!data) return <p>Cargando métricas...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-3 gap-6">
        <div className="p-4 bg-white shadow rounded">
          <h2 className="text-gray-500">Total Productos</h2>
          <p className="text-3xl font-bold">{data.totalProductos}</p>
        </div>
        <div className="p-4 bg-white shadow rounded">
          <h2 className="text-gray-500">Activos</h2>
          <p className="text-3xl font-bold text-green-600">
            {data.productosActivos}
          </p>
        </div>
        <div className="p-4 bg-white shadow rounded">
          <h2 className="text-gray-500">Inactivos</h2>
          <p className="text-3xl font-bold text-red-600">
            {data.productosInactivos}
          </p>
        </div>
        <div className="p-4 bg-white shadow rounded col-span-3">
          <h2 className="text-gray-500">Dólar actual</h2>
          <p className="text-2xl font-bold">${data.exchangeRate}</p>
        </div>
      </div>
    </div>
  );
}
