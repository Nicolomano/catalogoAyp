import { useEffect, useState } from "react";
import API from "../api/axios";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/orders", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => setOrders(res.data))
      .catch((err) => console.error("❌ Error cargando órdenes:", err))
      .finally(() => setLoading(false));
  }, []);

  const toggleStatus = async (id, currentStatus) => {
    const newStatus =
      currentStatus === "pendiente" ? "contestada" : "pendiente";
    try {
      const res = await API.patch(
        `/orders/${id}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setOrders(orders.map((o) => (o._id === id ? res.data : o)));
    } catch (err) {
      console.error("❌ Error actualizando estado:", err);
    }
  };

  if (loading) return <p>Cargando órdenes...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">📦 Órdenes</h2>
      {orders.length === 0 ? (
        <p>No hay órdenes registradas.</p>
      ) : (
        <table className="w-full bg-white shadow rounded-lg overflow-hidden">
          <thead className="bg-ayp text-white">
            <tr>
              <th className="p-3 text-left">Cliente</th>
              <th className="p-3 text-left">Teléfono</th>
              <th className="p-3 text-left">Total (ARS)</th>
              <th className="p-3 text-left">Fecha</th>
              <th className="p-3 text-left">Estado</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-b">
                <td className="p-3">{order.customerName}</td>
                <td className="p-3">{order.customerPhone}</td>
                <td className="p-3 font-bold">
                  {order.totalARS?.toLocaleString("es-AR", {
                    style: "currency",
                    currency: "ARS",
                  })}
                </td>
                <td className="p-3">
                  {new Date(order.createdAt).toLocaleString("es-AR")}
                </td>
                <td className="p-3">
                  {order.status === "pendiente" ? (
                    <span className="text-red-600 font-bold">Pendiente</span>
                  ) : (
                    <span className="text-green-600 font-bold">Contestada</span>
                  )}
                </td>
                <td className="p-3">
                  <button
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    onClick={() => toggleStatus(order._id, order.status)}
                  >
                    Marcar{" "}
                    {order.status === "pendiente" ? "Contestada" : "Pendiente"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminOrders;
