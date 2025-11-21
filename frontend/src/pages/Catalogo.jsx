import { useEffect, useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useCart } from "../Context/CartContext.jsx";
import toast from "react-hot-toast";
import HeroCarousel from "../components/HeroCarousel.jsx";

function Catalogo() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();
  const [quantities, setQuantities] = useState({});

  // filtros
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(""); // 👈 NUEVO
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [category, setCategory] = useState("all");
  const [subcategory, setSubcategory] = useState("all");
  const [sort, setSort] = useState("soldCount:desc");

  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  /* 🔹 Debounce de search (400ms) */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 900);
    return () => clearTimeout(t);
  }, [search]);

  /* 🔹 Cargar categorías y subcategorías */
  useEffect(() => {
    API.get("/products/meta/categories")
      .then((res) => {
        const data = res.data || [];
        const normalized =
          data.length && typeof data[0] === "string"
            ? data.map((c) => ({ category: c, subcategories: [] }))
            : data;
        setCategories(normalized);
      })
      .catch((err) => console.error("Error cargando categorías:", err));
  }, []);

  /* 🔹 Sincronizar filtros DESDE la URL */
  useEffect(() => {
    if (!categories.length) return;
    const cat = params.get("cat");
    const sub = params.get("sub");

    if (cat) {
      const sel = categories.find((c) => c.category === cat);
      if (sel) {
        setCategory(cat);
        setSubcategories(sel.subcategories || []);
        if (sub && sel.subcategories?.includes(sub)) setSubcategory(sub);
        else setSubcategory("all");
        return;
      }
    }
    setCategory("all");
    setSubcategories([]);
    setSubcategory("all");
  }, [categories, params]);

  /* 🔹 Obtener productos filtrados desde el backend (con debounce + cancelación) */
  useEffect(() => {
    const controller = new AbortController(); // 👈 cancelación
    setLoading(true);

    const query = new URLSearchParams();
    query.set("limit", 0);
    query.set("sort", sort);
    if (category !== "all") query.set("category", category);
    if (subcategory !== "all") query.set("subcategory", subcategory);
    // Solo buscar si hay 2+ chars; si no, no mandamos el parámetro
    if (debouncedSearch.length >= 2) query.set("search", debouncedSearch);

    API.get(`/products?${query.toString()}`, { signal: controller.signal })
      .then((res) => {
        const data = res.data?.products || [];
        setProducts(data);
      })
      .catch((err) => {
        if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
          console.error("Error cargando productos:", err);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort(); // 👈 cancela si cambia algo del effect
  }, [category, subcategory, sort, debouncedSearch]);

  /* 🔹 Helpers cantidad */
  const handleIncrease = (code) =>
    setQuantities((prev) => ({ ...prev, [code]: (prev[code] || 1) + 1 }));

  const handleDecrease = (code) =>
    setQuantities((prev) => {
      const newVal = (prev[code] || 1) - 1;
      return { ...prev, [code]: newVal > 1 ? newVal : 1 };
    });

  /* 🔹 Precio en 6 cuotas con +30% */
  const calcCuota6 = (priceARS) => {
    if (!priceARS || isNaN(priceARS)) return null;
    const cuota = (priceARS * 1.3) / 6;
    return Math.round(cuota);
  };

  /* 🔹 Sincronizar filtros HACIA la URL */
  const updateUrlForCategory = (selectedCat) => {
    const u = new URL(window.location.href);
    if (selectedCat === "all") {
      u.searchParams.delete("cat");
      u.searchParams.delete("sub");
    } else {
      u.searchParams.set("cat", selectedCat);
      u.searchParams.delete("sub");
    }
    navigate(`${u.pathname}${u.search}`, { replace: true });
  };

  const updateUrlForSubcategory = (value) => {
    const u = new URL(window.location.href);
    if (value === "all") u.searchParams.delete("sub");
    else u.searchParams.set("sub", value);
    navigate(`${u.pathname}${u.search}`, { replace: true });
  };

  /* 🔹 Loader */
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-ayp">
        <p className="text-white text-xl">Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ayp px-4 sm:px-6 md:px-8 py-6">
      {/* Banner / Slider */}
      <HeroCarousel type="home" />

      {/* 🔹 Filtros */}
      <div className="mt-6 flex flex-col md:flex-row md:flex-wrap justify-center items-stretch gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* Buscar */}
        <input
          type="text"
          placeholder="Buscar por nombre o código..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input w-full rounded-md px-3 py-2 outline-none"
          aria-label="Buscar por nombre o código"
        />

        {/* Categoría */}
        <select
          value={category}
          onChange={(e) => {
            const selectedCat = e.target.value;
            setCategory(selectedCat);
            const selected = categories.find((c) => c.category === selectedCat);
            setSubcategories(selected ? selected.subcategories : []);
            setSubcategory("all");
            updateUrlForCategory(selectedCat);
          }}
          className="search-select w-full rounded-md px-3 py-2 outline-none"
          aria-label="Filtrar por categoría"
        >
          <option value="all">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.category} value={c.category}>
              {c.category}
            </option>
          ))}
        </select>

        {/* Subcategoría */}
        {subcategories.length > 0 && (
          <select
            value={subcategory}
            onChange={(e) => {
              const value = e.target.value;
              setSubcategory(value);
              updateUrlForSubcategory(value);
            }}
            className="search-select w-full rounded-md px-3 py-2 outline-none"
            aria-label="Filtrar por subcategoría"
          >
            <option value="all">Todas las subcategorías</option>
            {subcategories.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        )}

        {/* Orden */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="search-select w-full rounded-md px-3 py-2 outline-none"
          aria-label="Ordenar"
        >
          <option value="name:asc">Orden alfabético (A-Z)</option>
          <option value="createdAt:desc">Más nuevos</option>
          <option value="soldCount:desc">Más vendidos</option>
          <option value="views:desc">Más populares</option>
          <option value="priceARS:desc">Mayor precio</option>
          <option value="priceARS:asc">Menor precio</option>
        </select>
      </div>

      {/* 🔹 Productos */}
      {products.length === 0 ? (
        <p className="text-white text-center text-lg">
          No se encontraron productos.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {products.map((p) => {
            const quantity = quantities[p.productCode] || 1;
            return (
              <div
                key={p._id}
                className="bg-white rounded-2xl shadow-lg md:hover:shadow-2xl md:transform md:hover:scale-[1.02] transition p-3 sm:p-4 flex flex-col"
              >
                <Link
                  to={`/product/${p.productCode}`}
                  className="flex flex-col items-center mb-3 sm:mb-4"
                >
                  <div className="w-full aspect-square flex items-center justify-center mb-3">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="object-contain max-h-full"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <h2 className="text-sm sm:text-base font-semibold text-gray-800 text-center line-clamp-2 min-h-[2.5rem]">
                    {p.name}
                  </h2>
                  {p.description && (
                    <p className="mt-1 text-xs sm:text-sm text-gray-500 text-center line-clamp-2">
                      {p.description}
                    </p>
                  )}
                </Link>

                {p.priceARS && (
                  <>
                    <p className="text-base sm:text-lg font-bold text-blue-700 mb-3 text-center">
                      ${p.priceARS.toLocaleString("es-AR")}
                    </p>
                    <p className="text-[11px] sm:text-xs text-gray-500 text-center -mt-2 mb-3">
                      ó 6 cuotas de{" "}
                      <strong className="font-semibold text-gray-600">
                        ${calcCuota6(p.priceARS)?.toLocaleString("es-AR")}
                      </strong>
                    </p>
                  </>
                )}

                <div className="flex items-center justify-center gap-2 mb-3">
                  <button
                    onClick={() => handleDecrease(p.productCode)}
                    className="bg-gray-500 hover:bg-gray-600 px-3 py-2 rounded active:scale-95"
                  >
                    −
                  </button>
                  <span className="px-4 font-bold text-blue-700 select-none">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleIncrease(p.productCode)}
                    className="bg-gray-500 hover:bg-gray-600 px-3 py-2 rounded active:scale-95"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => {
                    addToCart(p, quantity);
                    toast.success("Producto agregado con éxito");
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2 active:scale-[0.99]"
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
