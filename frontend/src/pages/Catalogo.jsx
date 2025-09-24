import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { useCart } from "../Context/CartContext.jsx";

function Catalogo() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    API.get("/products")
      .then((res) => {
        if (Array.isArray(res.data.products)) {
          setProducts(res.data.products);
        } else if (Array.isArray(res.data)) {
          setProducts(res.data);
        } else {
          setProducts([]);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-ayp">
        <p className="text-white text-xl">Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ayp p-8">
      <h1 className="text-3xl font-bold text-center mb-10 text-white uppercase tracking-wide">
        Catálogo A&P
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {products.map((p) => (
          <div
            key={p._id}
            className="bg-white text-ayp rounded-xl shadow-md overflow-hidden flex flex-col"
          >
            {/* Imagen clickable */}
            <Link to={`/product/${p.productCode}`}>
              <img
                src={p.image}
                alt={p.name}
                className="w-full h-56 object-cover hover:opacity-90 transition"
              />
            </Link>

            <div className="p-4 flex-1 flex flex-col justify-between">
              {/* Nombre clickable */}
              <Link to={`/product/${p.productCode}`}>
                <h2 className="text-lg font-bold uppercase hover:underline">
                  {p.name}
                </h2>
              </Link>

              {p.description && (
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {p.description}
                </p>
              )}

              {p.priceARS && (
                <p className="text-xl font-bold text-ayp mt-4">
                  {p.priceARS.toLocaleString("es-AR")} ARS
                </p>
              )}

              {/* Botón separado */}
              <button
                className="mt-4 bg-ayp text-white px-4 py-2 rounded-lg hover:bg-ayp-dark transition"
                onClick={() => {
                  addToCart(p);
                  alert(`Agregado al pedido: ${p.name}`);
                }}
              >
                Agregar al pedido
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Catalogo;
