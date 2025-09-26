import { Link, Outlet, useNavigate } from "react-router-dom";

function AdminLayout() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/admin/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-ayp text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-white/20">
          A&P Admin
        </div>
        <nav className="flex-1 p-4 space-y-3">
          <Link to="/admin/products" className="block hover:underline">
            📦 Productos
          </Link>
          <Link to="/admin/config" className="block hover:underline">
            ⚙️ Configuración
          </Link>
        </nav>
        <button
          onClick={logout}
          className="p-4 bg-red-600 hover:bg-red-700 text-white"
        >
          Cerrar sesión
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col">
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-ayp">
            Panel de administración
          </h1>
        </header>

        <section className="flex-1 p-6">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

export default AdminLayout;
