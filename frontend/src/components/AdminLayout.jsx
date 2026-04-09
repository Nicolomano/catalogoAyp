import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FolderTree } from "lucide-react";

function MenuItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-800 transition-colors ${
          isActive ? "bg-gray-800 text-white" : "text-gray-300"
        }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}

function AdminLayout() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/admin/login");
  };

  const linkBase =
    "block px-3 py-2 rounded hover:bg-white/10 transition-colors";
  const linkActive = "bg-white/15 font-semibold underline";

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-ayp text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-white/20">
          A&P Admin
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {/* Si tenés dashboard real, descomenta este bloque
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : ""}`
            }
          >
            🧭 Dashboard
          </NavLink>
          */}
          <NavLink
            to="/admin/products"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : ""}`
            }
          >
            📦 Productos
          </NavLink>

          <NavLink
            to="/admin/banners"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : ""}`
            }
          >
            🖼️ Banners / Slider
          </NavLink>
          <NavLink to="/admin/install-kit" className="...">
            🛠Kit de Instalación
          </NavLink>
          <MenuItem
            to="/admin/categories"
            icon={<FolderTree size={18} />}
            label="Categorías"
          />

          <NavLink
            to="/admin/orders"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : ""}`
            }
          >
            📋 Órdenes
          </NavLink>

          <NavLink
            to="/admin/config"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : ""}`
            }
          >
            ⚙️Configuración
          </NavLink>
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : ""}`
            }
          >
            👤 Services
          </NavLink>
          <NavLink
            to="/admin/landing"
            className={({ isActive }) =>
              `${linkBase} ${isActive ? linkActive : ""}`
            }
          >
            🏠 Página de inicio
          </NavLink>
          <NavLink
            to="/"
            className="ml-4 bg-white text-blue-800 px-3 py-1 rounded-md font-semibold hover:bg-blue-100 transition"
          >
            catálogo
          </NavLink>
        </nav>

        <button
          onClick={logout}
          className="m-4 mt-2 rounded bg-red-600 hover:bg-red-700 text-white px-4 py-2"
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
