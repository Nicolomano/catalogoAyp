import { Link, NavLink, Outlet } from "react-router-dom";
import { useCart } from "../Context/CartContext.jsx";
import { useAuth } from "../Context/AuthContext.jsx";
import { ShoppingCart, Menu, X, User, LogOut } from "lucide-react";
import { useState } from "react";

function Layout() {
  const { cart } = useCart();
  const { serviceUser, logoutService, isServiceApproved } = useAuth();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const adminToken = localStorage.getItem("token");
  const isAdmin = adminToken && !serviceUser;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-ayp text-white">
      {/* Navbar */}
      <header className="bg-ayp shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="text-xl sm:text-2xl font-bold uppercase tracking-wide hover:text-blue-200">
            A&P Refrigeración
          </Link>

          {/* Links desktop */}
          <nav className="hidden md:flex items-center space-x-5">
            <NavLink to="/" end className={({ isActive }) =>
              `hover:text-blue-200 text-sm ${isActive ? "font-bold underline" : ""}`}>
              Inicio
            </NavLink>
            <NavLink to="/catalogo" className={({ isActive }) =>
              `hover:text-blue-200 text-sm ${isActive ? "font-bold underline" : ""}`}>
              Catálogo
            </NavLink>
            <NavLink to="/kit-instalacion" className={({ isActive }) =>
              `hover:text-blue-200 text-sm ${isActive ? "font-bold underline" : ""}`}>
              Kit de Instalación
            </NavLink>
            <NavLink to="/contacto" className={({ isActive }) =>
              `hover:text-blue-200 text-sm ${isActive ? "font-bold underline" : ""}`}>
              Contacto
            </NavLink>
            {isAdmin && (
              <NavLink to="/admin/dashboard" className={({ isActive }) =>
                `hover:text-blue-200 text-sm ${isActive ? "font-bold underline" : ""}`}>
                Admin
              </NavLink>
            )}
          </nav>

          {/* Derecha: user + carrito + hamburguesa */}
          <div className="flex items-center gap-3">
            {/* Usuario service */}
            {serviceUser ? (
              <div className="hidden md:flex items-center gap-2">
                {isServiceApproved && (
                  <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                    Precio service
                  </span>
                )}
                <span className="text-sm text-blue-200">{serviceUser.name}</span>
                <button
                  onClick={logoutService}
                  className="hover:text-red-300 transition"
                  title="Cerrar sesión"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="hidden md:flex items-center gap-1 text-sm hover:text-blue-200">
                <User className="h-4 w-4" />
                <span>Soy service</span>
              </Link>
            )}

            {/* Carrito */}
            <div className="relative">
              <Link to="/cart" className="flex items-center">
                <ShoppingCart className="h-6 w-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>

            {/* Hamburguesa mobile */}
            <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Menú mobile */}
        {menuOpen && (
          <nav className="md:hidden bg-ayp border-t border-blue-900 px-6 py-4 space-y-4">
            {[
              { to: "/", label: "Inicio", end: true },
              { to: "/catalogo", label: "Catálogo" },
              { to: "/kit-instalacion", label: "Kit de Instalación" },
              { to: "/contacto", label: "Contacto" },
            ].map(({ to, label, end }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) =>
                  `block text-sm hover:text-blue-200 ${isActive ? "font-bold underline" : ""}`}
                onClick={() => setMenuOpen(false)}>
                {label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink to="/admin/dashboard"
                className={({ isActive }) =>
                  `block text-sm hover:text-blue-200 ${isActive ? "font-bold underline" : ""}`}
                onClick={() => setMenuOpen(false)}>
                Admin
              </NavLink>
            )}
            {serviceUser ? (
              <div className="pt-2 border-t border-blue-900 space-y-2">
                <p className="text-sm text-blue-200">{serviceUser.name}</p>
                {isServiceApproved && (
                  <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                    Precio service activo
                  </span>
                )}
                <button onClick={() => { logoutService(); setMenuOpen(false); }}
                  className="flex items-center gap-2 text-sm text-red-300 hover:text-red-200">
                  <LogOut className="h-4 w-4" /> Cerrar sesión
                </button>
              </div>
            ) : (
              <Link to="/login"
                className="flex items-center gap-2 text-sm hover:text-blue-200"
                onClick={() => setMenuOpen(false)}>
                <User className="h-4 w-4" /> Soy service — Iniciar sesión
              </Link>
            )}
          </nav>
        )}
      </header>

      <main className="flex-grow w-full">
        <Outlet />
      </main>

      <footer className="bg-ayp/90 py-4 text-center text-sm text-gray-200">
        © {new Date().getFullYear()} A&P Refrigeración. Todos los derechos reservados.
      </footer>
    </div>
  );
}

export default Layout;
