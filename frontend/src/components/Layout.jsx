import { Link, Outlet } from "react-router-dom";
import { useCart } from "../Context/CartContext.jsx";

function Layout() {
  const { cart } = useCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const token = localStorage.getItem("token");
  return (
    <div className="flex flex-col min-h-screen bg-ayp text-white">
      {/* 🔹 Navbar */}
      <header className="bg-ayp shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo / Nombre */}
          <Link
            to="/"
            className="text-2xl font-bold uppercase tracking-wide hover:text-gray-200"
          >
            A&P Refrigeración
          </Link>

          {/* Links */}
          <nav className="space-x-6">
            <Link to="/" className="hover:underline">
              Catálogo
            </Link>
            <Link to="/contacto" className="hover:underline">
              Contacto
            </Link>
            {token && (
              <Link to="/admin/dashboard" className="hover:underline">
                Admin
              </Link>
            )}
            <Link to="/cart" className="hover:underline">
              🛒
              {
                <span className="absolute top-2 right-26 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {totalItems}
                </span>
              }
            </Link>
          </nav>
        </div>
      </header>

      {/* 🔹 Contenido dinámico */}
      <main className="flex-grow container mx-auto px-6 py-8">
        <Outlet />
      </main>

      {/* 🔹 Footer */}
      <footer className="bg-blue-950 py-4 text-center text-sm">
        © {new Date().getFullYear()} A&P Refrigeración. Todos los derechos
        reservados.
      </footer>
    </div>
  );
}

export default Layout;
