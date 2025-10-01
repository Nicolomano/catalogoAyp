import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { useCart } from "../Context/CartContext.jsx";
import toast from "react-hot-toast";

function Catalogo() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();
  const [quantities, setQuantities] = useState({});

  // filtros
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [sort, setSort] = useState("views:desc"); // 👈 nuevo estado para ordenar

  // cargar productos desde API
  useEffect(() => {
    setLoading(true);
    API.get(`/products?limit=0&sort=${sort}`)
      .then((res) => {
        let prods = [];
        if (Array.isArray(res.data.products)) prods = res.data.products;
        else if (Array.isArray(res.data)) prods = res.data;

        setProducts(prods);
        setFilteredProducts(prods);

        // 🔹 obtener categorías únicas
        const uniqueCats = [
          ...new Set(prods.map((p) => p.category).filter(Boolean)),
        ];
        setCategories(uniqueCats);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [sort]); // 👈 vuelve a cargar si cambia el orden

  // 🔹 Filtro dinámico en memoria
  useEffect(() => {
    let result = [...products];

    if (category !== "all") {
      result = result.filter((p) => p.category === category);
    }

    if (search.trim() !== "") {
      const term = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.productCode.toLowerCase().includes(term)
      );
    }

    setFilteredProducts(result);
  }, [search, category, products]);

  const handleIncrease = (code) => {
    setQuantities((prev) => ({ ...prev, [code]: (prev[code] || 1) + 1 }));
  };

  const handleDecrease = (code) => {
    setQuantities((prev) => {
      const newVal = (prev[code] || 1) - 1;
      return { ...prev, [code]: newVal > 1 ? newVal : 1 };
    });
  };

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

      {/* 🔹 Barra de búsqueda, categoría y orden */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-8">
        <input
          type="text"
          placeholder="Buscar por nombre o código..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 rounded-lg border border-gray-300 text-black"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full md:w-1/4 px-4 py-2 rounded-lg border border-gray-300 text-black"
        >
          <option value="all">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* 👇 Nuevo selector de orden */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full md:w-1/4 px-4 py-2 rounded-lg border border-gray-300 text-black"
        >
          <option value="name:asc">Orden alfabético (A-Z)</option>
          <option value="createdAt:desc">Más nuevos</option>
          <option value="soldCount:desc">Más vendidos</option>
          <option value="views:desc">Más populares</option>
          <option value="priceARS:desc">Mayor precio</option>
          <option value="priceARS:asc">Menor precio</option>
        </select>
      </div>

      {/* 🔹 Grid de productos */}
      {filteredProducts.length === 0 ? (
        <p className="text-white text-center text-lg">
          No se encontraron productos.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {filteredProducts.map((p) => {
            const quantity = quantities[p.productCode] || 1;
            return (
              <div
                key={p._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition p-6 flex flex-col"
              >
                {/* Imagen + info */}
                <Link
                  to={`/product/${p.productCode}`}
                  className="flex flex-col items-center mb-4"
                >
                  <div className="h-40 flex items-center justify-center mb-4">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="object-contain max-h-full"
                    />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800 text-center">
                    {p.name}
                  </h2>
                  {p.description && (
                    <p className="text-sm text-gray-500 text-center line-clamp-2">
                      {p.description}
                    </p>
                  )}
                </Link>

                {/* Precio */}
                {p.priceARS && (
                  <p className="text-xl font-bold text-blue-700 mb-4 text-center">
                    {p.priceARS.toLocaleString("es-AR")} ARS
                  </p>
                )}

                {/* Controles cantidad */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <button
                    onClick={() => handleDecrease(p.productCode)}
                    className="bg-gray-500 hover:bg-gray-600 px-3 py-1 rounded"
                  >
                    −
                  </button>
                  <span className="px-4 font-bold text-blue-700">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleIncrease(p.productCode)}
                    className="bg-gray-500 hover:bg-gray-600 px-3 py-1 rounded"
                  >
                    +
                  </button>
                </div>

                {/* Botón agregar */}
                <button
                  onClick={() => {
                    addToCart(p, quantity);
                    toast.success("Producto agregado con éxito");
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  🛒 Agregar al pedido
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Catalogo;
