import AdminProducts from "./AdminProducts.jsx";
import AdminConfig from "./AdminConfig.jsx";

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-6 text-ayp">
        Panel de Administración
      </h1>

      {/* Configuración del dólar */}
      <AdminConfig />

      {/* Gestión de productos */}
      <AdminProducts />
    </div>
  );
}
