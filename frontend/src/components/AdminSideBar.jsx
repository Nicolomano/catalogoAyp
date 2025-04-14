import { Link } from 'react-router-dom';

export default function AdminSidebar() {
  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen p-4">
      <h2 className="text-xl font-bold mb-6">Panel Admin</h2>
      <nav className="flex flex-col gap-4">
        <Link to="/admin/products" className="hover:text-blue-400">📦 Productos</Link>
        <Link to="/admin/exchange-rate" className="hover:text-blue-400">💱 Tipo de cambio</Link>
      </nav>
    </aside>
  );
}