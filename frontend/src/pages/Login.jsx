import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import toast from "react-hot-toast";

function Login() {
  const { loginService, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await loginService(email, password);
    if (result.ok) {
      toast.success("¡Bienvenido! Accedés a precios especiales.");
      navigate("/catalogo");
    } else if (result.pending) {
      toast("Tu cuenta está pendiente de aprobación. Te avisamos por email.", { icon: "⏳" });
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-ayp flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Iniciar sesión</h1>
        <p className="text-sm text-gray-500 mb-6">
          Accedé a precios especiales para services matriculados.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          ¿No tenés cuenta?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Registrate como service
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
