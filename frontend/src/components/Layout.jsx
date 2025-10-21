import { Link, NavLink, Outlet } from "react-router-dom";
import { useCart } from "../Context/CartContext.jsx";
import { ShoppingCart, Menu, X } from "lucide-react";
import { useState } from "react";

function Layout() {
  const { cart } = useCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const token = localStorage.getItem("token");
  const [menuOpen, setMenuOpen] = useState(false);

  const clearAndGoHome = () => {
    if (window.location.search) window.history.pushState({}, "", "/");
  };

  return (
    <div className="flex flex-col min-h-screen bg-ayp text-white">
      {/* 🔹 Navbar */}
      <header className="bg-ayp shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold uppercase tracking-wide hover:text-blue-200"
          >
            A&P Refrigeración
          </Link>

          {/* Links desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <NavLink
              to="/"
              onClick={clearAndGoHome}
              className={({ isActive }) =>
                `hover:text-blue-200 ${isActive ? "font-bold underline" : ""}`
              }
            >
              Catálogo
            </NavLink>
            <NavLink
              to="/kit-instalacion"
              className={({ isActive }) =>
                `hover:text-blue-200 ${isActive ? "font-bold underline" : ""}`
              }
            >
              Kit de Instalación
            </NavLink>

            <NavLink
              to="/contacto"
              className={({ isActive }) =>
                `hover:text-blue-200 ${isActive ? "font-bold underline" : ""}`
              }
            >
              Contacto
            </NavLink>
            {token && (
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) =>
                  `hover:text-blue-200 ${isActive ? "font-bold underline" : ""}`
                }
              >
                Admin
              </NavLink>
            )}
          </nav>

          {/* Carrito + Hamburguesa */}
          <div className="flex items-center gap-4">
            {/* Carrito */}
            <div className="relative">
              <Link to="/cart" className="flex items-center">
                <ShoppingCart className="h-6 w-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>

            {/* Botón menú (solo mobile) */}
            <button
              className="md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Menú mobile */}
        {menuOpen && (
          <nav className="md:hidden bg-ayp border-t border-blue-900 px-6 py-4 space-y-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `block hover:text-blue-200 ${
                  isActive ? "font-bold underline" : ""
                }`
              }
              onClick={() => setMenuOpen(false)}
            >
              Catálogo
            </NavLink>
            <NavLink
              to="/kit-instalacion"
              className={({ isActive }) =>
                `block hover:text-blue-200 ${
                  isActive ? "font-bold underline" : ""
                }`
              }
              onClick={() => setMenuOpen(false)}
            >
              Kit de Instalación
            </NavLink>
            <NavLink
              to="/contacto"
              className={({ isActive }) =>
                `block hover:text-blue-200 ${
                  isActive ? "font-bold underline" : ""
                }`
              }
              onClick={() => setMenuOpen(false)}
            >
              Contacto
            </NavLink>
            {token && (
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) =>
                  `block hover:text-blue-200 ${
                    isActive ? "font-bold underline" : ""
                  }`
                }
                onClick={() => setMenuOpen(false)}
              >
                Admin
              </NavLink>
            )}
          </nav>
        )}
      </header>

      {/* 🔹 Contenido dinámico */}
      <main className="flex-grow max-w-7xl mx-auto px-6 py-8 w-full">
        <Outlet />
      </main>

      {/* 🔹 Footer */}
      <footer className="bg-ayp/90 py-4 text-center text-sm text-gray-200">
        © {new Date().getFullYear()} A&P Refrigeración. Todos los derechos
        reservados.
      </footer>
    </div>
  );
}

export default Layout;
