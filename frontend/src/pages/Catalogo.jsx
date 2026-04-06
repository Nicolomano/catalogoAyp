import { useEffect, useState, useMemo, useTransition, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { SlidersHorizontal } from "lucide-react";
import API from "../api/axios";
import { useCart } from "../Context/CartContext.jsx";
import { useAuth } from "../Context/AuthContext.jsx";
import toast from "react-hot-toast";
import HeroCarousel from "../components/HeroCarousel.jsx";
import Sidebar from "../components/Sidebar.jsx";

const PAGE_SIZE = 24;

function Catalogo() {
  const [allProducts, setAllProducts] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();

  const { addToCart } = useCart();
  const { isServiceApproved, servicePrice } = useAuth();
  const [quantities, setQuantities] = useState({});

  // filtros
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("all");
  const [subcategory, setSubcategory] = useState("all");
  const [sort, setSort] = useState("soldCount:desc");
  const [brands, setBrands] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loaderRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Cargar categorías y marcas
  useEffect(() => {
    API.get("/products/meta/categories").then((res) => {
      const data = res.data || [];
      const normalized = data.length && typeof data[0] === "string"
        ? data.map((c) => ({ category: c, subcategories: [] }))
        : data;
      setCategories(normalized);
    }).catch(() => {});

    API.get("/products/brands").then((res) => {
      setBrands(res.data || []);
    }).catch(() => {});
  }, []);

  // URL → filtros
  useEffect(() => {
    if (!categories.length) return;
    const cat = params.get("cat");
    const sub = params.get("sub");
    if (cat) {
      const sel = categories.find((c) => c.category === cat);
      if (sel) {
        setCategory(cat);
        setSubcategory(sub && sel.subcategories?.includes(sub) ? sub : "all");
        return;
      }
    }
    setCategory("all");
    setSubcategory("all");
  }, [categories, params]);

  // Reset al cambiar filtros
  useEffect(() => {
    setPage(1);
    setAllProducts([]);
    setHasMore(true);
  }, [category, subcategory, sort, debouncedSearch, selectedBrands]);

  // Fetch paginado
  useEffect(() => {
    const controller = new AbortController();
    setIsFetching(true);

    const qs = new URLSearchParams();
    qs.set("limit", PAGE_SIZE);
    qs.set("page", page);
    qs.set("sort", sort);
    if (category !== "all") qs.set("category", category);
    if (subcategory !== "all") qs.set("subcategory", subcategory);
    if (debouncedSearch.length >= 2) qs.set("search", debouncedSearch);
    selectedBrands.forEach((b) => qs.append("brand", b));

    API.get(`/products?${qs.toString()}`, { signal: controller.signal })
      .then((res) => {
        const incoming = res.data?.products || [];
        setHasMore(res.data?.hasMore ?? false);
        startTransition(() => {
          setAllProducts((prev) => page === 1 ? incoming : [...prev, ...incoming]);
        });
      })
      .catch((err) => {
        if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED")
          console.error("Error cargando productos:", err);
      })
      .finally(() => setIsFetching(false));

    return () => controller.abort();
  }, [category, subcategory, sort, debouncedSearch, selectedBrands, page]);

  // Infinite scroll
  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isFetching) setPage((p) => p + 1);
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, isFetching]);

  const handleIncrease = (code) =>
    setQuantities((prev) => ({ ...prev, [code]: (prev[code] || 1) + 1 }));
  const handleDecrease = (code) =>
    setQuantities((prev) => ({ ...prev, [code]: Math.max(1, (prev[code] || 1) - 1) }));

  const calcCuota6 = (price) =>
    price ? Math.round((price * 1.3) / 6) : null;

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setSubcategory("all");
    const u = new URL(window.location.href);
    if (cat === "all") { u.searchParams.delete("cat"); u.searchParams.delete("sub"); }
    else { u.searchParams.set("cat", cat); u.searchParams.delete("sub"); }
    navigate(`${u.pathname}${u.search}`, { replace: true });
  };

  const handleSubcategoryChange = (sub) => {
    setSubcategory(sub);
    const u = new URL(window.location.href);
    if (sub === "all") u.searchParams.delete("sub");
    else u.searchParams.set("sub", sub);
    navigate(`${u.pathname}${u.search}`, { replace: true });
  };

  const handleBrandToggle = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const handleClearAll = () => {
    setCategory("all");
    setSubcategory("all");
    setSelectedBrands([]);
    setSearch("");
    navigate("/catalogo", { replace: true });
  };

  const activeFilterCount =
    (category !== "all" ? 1 : 0) +
    (subcategory !== "all" ? 1 : 0) +
    selectedBrands.length;

  const helmetTitle = category !== "all"
    ? `${category} | A&P Refrigeración`
    : "Catálogo | A&P Refrigeración";

  return (
    <>
      <Helmet>
        <title>{helmetTitle}</title>
        <meta name="description" content={
          category !== "all"
            ? `Productos de ${category} en A&P Refrigeración.`
            : "Catálogo completo de A&P Refrigeración. Repuestos y equipos de refrigeración."
        } />
      </Helmet>

      <div className="min-h-screen bg-ayp">
        <HeroCarousel type="catalog" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex gap-6">

          {/* Sidebar desktop */}
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="bg-white rounded-xl shadow sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
              <Sidebar
                categories={categories}
                selectedCategory={category}
                selectedSubcategory={subcategory}
                onCategoryChange={handleCategoryChange}
                onSubcategoryChange={handleSubcategoryChange}
                brands={brands}
                selectedBrands={selectedBrands}
                onBrandToggle={handleBrandToggle}
                onClearAll={handleClearAll}
                activeFilterCount={activeFilterCount}
              />
            </div>
          </aside>

          {/* Contenido principal */}
          <div className="flex-1 min-w-0">
            {/* Barra de búsqueda + controles */}
            <div className="flex gap-2 mb-4">
              {/* Botón filtros mobile */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden flex items-center gap-1.5 bg-white/10 border border-white/20 text-white text-sm px-3 py-2 rounded-lg"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filtros
                {activeFilterCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-1.5 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Búsqueda */}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Buscar por nombre o código..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="search-input w-full rounded-lg px-3 py-2 text-sm outline-none pr-8"
                />
                {(isFetching || isPending) && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 animate-spin h-4 w-4 border-2 border-white/50 border-t-transparent rounded-full" />
                )}
              </div>

              {/* Orden */}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="search-select hidden sm:block rounded-lg px-3 py-2 text-sm outline-none"
              >
                <option value="soldCount:desc">Más vendidos</option>
                <option value="name:asc">A-Z</option>
                <option value="createdAt:desc">Más nuevos</option>
                <option value="priceARS:asc">Menor precio</option>
                <option value="priceARS:desc">Mayor precio</option>
              </select>
            </div>

            {/* Badge de precio service */}
            {isServiceApproved && (
              <div className="mb-4 bg-green-500/20 border border-green-400/30 rounded-lg px-4 py-2 text-sm text-green-200 flex items-center gap-2">
                ✅ Estás viendo precios con <strong>10% de descuento service</strong>
              </div>
            )}

            {/* Grid */}
            {allProducts.length === 0 && !isFetching ? (
              <p className="text-white text-center text-lg py-12">No se encontraron productos.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {allProducts.map((p) => {
                  const qty = quantities[p.productCode] || 1;
                  const displayPrice = isServiceApproved ? servicePrice(p.priceARS) : p.priceARS;
                  return (
                    <div key={p._id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-3 flex flex-col">
                      <Link to={`/product/${p.productCode}`} className="flex flex-col items-center mb-2">
                        <div className="w-full aspect-square flex items-center justify-center mb-2">
                          {p.image ? (
                            <img src={p.image} alt={p.name}
                              className="object-contain max-h-full" loading="lazy" decoding="async" />
                          ) : (
                            <div className="text-gray-200 text-4xl">📦</div>
                          )}
                        </div>
                        {p.brand && (
                          <span className="text-xs text-gray-400 mb-1">{p.brand}</span>
                        )}
                        <h2 className="text-sm font-semibold text-gray-800 text-center line-clamp-2 min-h-[2.5rem]">
                          {p.name}
                        </h2>
                      </Link>

                      {!p.inStock && (
                        <span className="text-xs text-center bg-red-100 text-red-600 rounded-full px-2 py-0.5 mb-2">
                          Sin stock
                        </span>
                      )}

                      {displayPrice ? (
                        <>
                          <p className="text-base font-bold text-blue-700 mb-1 text-center">
                            ${displayPrice.toLocaleString("es-AR")}
                            {isServiceApproved && (
                              <span className="ml-1 text-xs text-green-600 font-normal">service</span>
                            )}
                          </p>
                          <p className="text-[10px] text-gray-400 text-center -mt-1 mb-2">
                            ó 6 cuotas de ${calcCuota6(displayPrice)?.toLocaleString("es-AR")}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-gray-400 text-center mb-2 italic">Consultar</p>
                      )}

                      <div className="flex items-center justify-center gap-2 mb-2">
                        <button onClick={() => handleDecrease(p.productCode)}
                          className="bg-gray-200 hover:bg-gray-300 w-7 h-7 rounded flex items-center justify-center text-gray-700">−</button>
                        <span className="w-6 text-center font-bold text-blue-700 text-sm">{qty}</span>
                        <button onClick={() => handleIncrease(p.productCode)}
                          className="bg-gray-200 hover:bg-gray-300 w-7 h-7 rounded flex items-center justify-center text-gray-700">+</button>
                      </div>

                      <button
                        onClick={() => { addToCart(p, qty); toast.success("Agregado al pedido"); }}
                        disabled={!p.inStock}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs py-2 rounded-lg"
                      >
                        {p.inStock ? "🛒 Agregar" : "Sin stock"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Sentinel infinite scroll */}
            <div ref={loaderRef} className="h-4" />
            {isFetching && (
              <div className="flex justify-center py-6">
                <div className="animate-spin h-8 w-8 border-4 border-white/50 border-t-transparent rounded-full" />
              </div>
            )}
            {!hasMore && allProducts.length > 0 && (
              <p className="text-white/50 text-center py-4 text-xs">
                {allProducts.length} productos mostrados
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Drawer mobile */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setDrawerOpen(false)} />
      )}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 lg:hidden ${
        drawerOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Sidebar
          categories={categories}
          selectedCategory={category}
          selectedSubcategory={subcategory}
          onCategoryChange={(c) => { handleCategoryChange(c); setDrawerOpen(false); }}
          onSubcategoryChange={(s) => { handleSubcategoryChange(s); setDrawerOpen(false); }}
          brands={brands}
          selectedBrands={selectedBrands}
          onBrandToggle={handleBrandToggle}
          onClearAll={() => { handleClearAll(); setDrawerOpen(false); }}
          activeFilterCount={activeFilterCount}
          onClose={() => setDrawerOpen(false)}
        />
      </div>
    </>
  );
}

export default Catalogo;
