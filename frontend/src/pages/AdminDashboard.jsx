import AdminProducts from "./AdminProducts.jsx";
import AdminConfig from "./AdminConfig.jsx";
import DashboardData from "../components/DashboardData.jsx";
export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-6 text-ayp">
        Panel de Administración
      </h1>

      <DashboardData></DashboardData>
      {/* Gestión de productos */}
      <AdminProducts />
    </div>
  );
}
