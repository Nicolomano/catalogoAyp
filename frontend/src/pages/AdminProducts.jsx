import { useEffect, useMemo, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

const AUTH_HEADER = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filtros
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [subcategory, setSubcategory] = useState("all");
  const [sort, setSort] = useState("createdAt:desc");

  // Meta categorías
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  // ────────────────────────────────────────────────────────────
  // Cargar categorías + subcategorías
  useEffect(() => {
    API.get("/products/meta/categories")
      .then((res) => {
        // Soporta ambos formatos: strings o objetos {category, subcategories}
        const data = res.data || [];
        let cats = [];
        if (data.length && typeof data[0] === "string") {
          cats = data.map((c) => ({ category: c, subcategories: [] }));
        } else {
          cats = data;
        }
        setCategories(cats);

        // Si ya hay una categoría elegida, poblar sus subcategorías
        if (category !== "all") {
          const found = cats.find((c) => c.category === category);
          setSubcategories(found ? found.subcategories : []);
        }
      })
      .catch((e) => console.error("Error meta categorías:", e));
  }, []); // una sola vez

  // Cuando cambia la categoría (filtro de tabla), actualizar subcategorías dependientes
  useEffect(() => {
    const found = categories.find((c) => c.category === category);
    setSubcategories(found ? found.subcategories : []);
    setSubcategory("all");
  }, [category, categories]);

  // ────────────────────────────────────────────────────────────
  // Debounce para búsqueda
  const debouncedSearch = useMemo(() => {
    let t;
    return (value, cb) => {
      clearTimeout(t);
      t = setTimeout(() => cb(value), 400);
    };
  }, []);

  // Opciones para autocompletar en el modal (categoría/subcategoría)
  const categoryOptions = useMemo(
    () => categories.map((c) => c.category).filter(Boolean),
    [categories]
  );
  const subcategoryOptions = useMemo(() => {
    const sel = editingProduct?.category || "";
    const found = categories.find((c) => c.category === sel);
    return (found?.subcategories || []).filter(Boolean);
  }, [categories, editingProduct?.category]);

  // ────────────────────────────────────────────────────────────
  const fetchProducts = async ({
    searchParam = search,
    categoryParam = category,
    subcategoryParam = subcategory,
    sortParam = sort,
  } = {}) => {
    setLoading(true);
    try {
      const params = {};
      if (searchParam?.trim()) params.search = searchParam.trim();
      if (categoryParam !== "all") params.category = categoryParam;
      if (subcategoryParam !== "all") params.subcategory = subcategoryParam;
      if (sortParam) params.sort = sortParam;
      // si querés TODO sin paginar, podés enviar limit=0
      params.limit = 0;

      const res = await API.get("/products/admin/all", {
        headers: AUTH_HEADER(),
        params,
      });

      if (Array.isArray(res.data.products)) setProducts(res.data.products);
      else if (Array.isArray(res.data)) setProducts(res.data);
      else setProducts([]);
    } catch (err) {
      console.error("❌ Error obteniendo productos (admin):", err);
      toast.error("No se pudieron cargar los productos");
    } finally {
      setLoading(false);
    }
  };

  // Primera carga
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch al cambiar filtros/orden (excepto search, que usa debounce)
  useEffect(() => {
    fetchProducts({}); // usa los estados actuales
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, subcategory, sort]);

  // ────────────────────────────────────────────────────────────
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    debouncedSearch(value, (v) => {
      fetchProducts({ searchParam: v });
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Seguro que quieres eliminar este producto?")) return;
    try {
      await API.delete(`/products/${id}`, { headers: AUTH_HEADER() });
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success("✅ Producto eliminado con éxito");
    } catch (err) {
      console.error(
        "❌ Error al eliminar producto:",
        err.response?.data || err
      );
      toast.error("❌ Error al eliminar producto");
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await API.patch(
        `/products/${id}/toggle`,
        {},
        { headers: AUTH_HEADER() }
      );
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? res.data.product : p))
      );
      toast.success(res.data.message);
    } catch (err) {
      console.error("❌ Error al cambiar estado:", err.response?.data || err);
      toast.error("❌ No se pudo cambiar el estado del producto");
    }
  };

  // ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Encabezado y filtros */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de productos</h2>
          <p className="text-sm text-gray-600">
            Buscar, filtrar por categoría/subcategoría y ordenar resultados.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          {/* Búsqueda */}
          <input
            type="text"
            placeholder="Buscar por nombre o código..."
            value={search}
            onChange={handleSearchChange}
            className="border rounded px-3 py-2 md:w-72"
          />

          {/* Categoría (filtro de tabla) */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="all">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.category} value={c.category}>
                {c.category}
              </option>
            ))}
          </select>

          {/* Subcategoría (filtro de tabla) */}
          <select
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            className="border rounded px-3 py-2"
            disabled={subcategories.length === 0}
          >
            <option value="all">Todas las subcategorías</option>
            {subcategories.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Orden */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="createdAt:desc">Más nuevos</option>
            <option value="name:asc">Nombre (A-Z)</option>
            <option value="name:desc">Nombre (Z-A)</option>
            <option value="priceARS:asc">Precio (menor a mayor)</option>
            <option value="priceARS:desc">Precio (mayor a menor)</option>
            <option value="active:desc">Estado (activos primero)</option>
          </select>

          {/* Nuevo producto */}
          <button
            className="bg-ayp text-white px-4 py-2 rounded hover:bg-ayp-dark"
            onClick={() =>
              setEditingProduct({
                name: "",
                description: "",
                priceUSD: 0,
                priceARS: "",
                fixedInARS: false,
                category: "",
                subcategory: "",
                productCode: "",
              })
            }
          >
            ➕ Nuevo producto
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded">
            <span className="text-sm text-gray-600">Cargando…</span>
          </div>
        )}

        <table className="w-full bg-white shadow rounded-lg overflow-hidden">
          <thead className="bg-ayp text-white">
            <tr>
              <th className="p-3 text-left">Imagen</th>
              <th className="p-3 text-left">Código</th>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-left">Categoría</th>
              <th className="p-3 text-left">Subcategoría</th>
              <th className="p-3 text-left">Precio (ARS)</th>
              <th className="p-3 text-left">Precio (USD)</th>
              <th className="p-3 text-left">Estado</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} className="border-b">
                <td className="p-3">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ) : (
                    <span className="text-gray-400 italic">Sin imagen</span>
                  )}
                </td>
                <td className="p-3">{p.productCode}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span>{p.name}</span>
                    {p.fixedInARS && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                        Fijo en ARS
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-3">{p.category || "-"}</td>
                <td className="p-3">{p.subcategory || "-"}</td>
                <td className="p-3">
                  {p.priceARS !== undefined && p.priceARS !== null
                    ? Number(p.priceARS).toLocaleString("es-AR", {
                        style: "currency",
                        currency: "ARS",
                      })
                    : "-"}
                </td>
                <td className="p-3">
                  {p.priceUSD !== undefined && p.priceUSD !== null
                    ? Number(p.priceUSD).toLocaleString("es-AR", {
                        style: "currency",
                        currency: "USD",
                      })
                    : "-"}
                </td>
                <td className="p-3">
                  {p.active ? (
                    <span className="text-green-600 font-bold">Activo</span>
                  ) : (
                    <span className="text-red-600 font-bold">Inactivo</span>
                  )}
                </td>
                <td className="p-3 flex gap-2">
                  <button
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    onClick={() => setEditingProduct(p)}
                  >
                    Editar
                  </button>
                  <button
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    onClick={() => handleToggle(p._id)}
                  >
                    {p.active ? "Desactivar" : "Activar"}
                  </button>
                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    onClick={() => handleDelete(p._id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}

            {products.length === 0 && !loading && (
              <tr>
                <td colSpan="9" className="p-6 text-center text-gray-500">
                  No hay resultados para los filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de edición / creación */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-[520px] max-w-[95vw]">
            <h3 className="text-lg font-bold mb-4">
              {editingProduct._id ? "Editar producto" : "Nuevo producto"}
            </h3>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const formData = new FormData();

                  // Normalización suave de espacios
                  const norm = (s) => (s || "").trim().replace(/\s+/g, " ");

                  formData.append("name", editingProduct.name);
                  formData.append("description", editingProduct.description);
                  formData.append("productCode", editingProduct.productCode);

                  // Dual pricing: solo enviar lo que corresponde
                  if (editingProduct.fixedInARS) {
                    // fijo en ARS → enviar priceARS (requerido visualmente) y opcionalmente priceUSD si lo usás de referencia
                    if (
                      editingProduct.priceARS !== "" &&
                      editingProduct.priceARS !== null &&
                      editingProduct.priceARS !== undefined
                    ) {
                      formData.append("priceARS", editingProduct.priceARS);
                    }
                    // priceUSD opcional (si querés almacenar también el USD referencial)
                    if (
                      editingProduct.priceUSD !== "" &&
                      editingProduct.priceUSD !== null &&
                      editingProduct.priceUSD !== undefined
                    ) {
                      formData.append("priceUSD", editingProduct.priceUSD);
                    }
                  } else {
                    // dinámico por dólar → enviar priceUSD (requerido) y NO enviar priceARS (lo calcula backend)
                    if (
                      editingProduct.priceUSD !== "" &&
                      editingProduct.priceUSD !== null &&
                      editingProduct.priceUSD !== undefined
                    ) {
                      formData.append("priceUSD", editingProduct.priceUSD);
                    }
                  }

                  formData.append(
                    "fixedInARS",
                    editingProduct.fixedInARS ? "true" : "false"
                  );
                  formData.append("category", norm(editingProduct.category));
                  formData.append(
                    "subcategory",
                    norm(editingProduct.subcategory)
                  );

                  if (editingProduct.imageFile) {
                    formData.append("image", editingProduct.imageFile);
                  }

                  let res;
                  if (editingProduct._id) {
                    res = await API.put(
                      `/products/${editingProduct._id}`,
                      formData,
                      {
                        headers: {
                          ...AUTH_HEADER(),
                          "Content-Type": "multipart/form-data",
                        },
                      }
                    );
                    setProducts((prev) =>
                      prev.map((p) =>
                        p._id === editingProduct._id ? res.data : p
                      )
                    );
                    toast.success("✅ Producto actualizado con éxito");
                  } else {
                    res = await API.post("/products", formData, {
                      headers: {
                        ...AUTH_HEADER(),
                        "Content-Type": "multipart/form-data",
                      },
                    });
                    setProducts((prev) => [res.data, ...prev]);
                    toast.success("✅ Producto creado con éxito");
                  }

                  setEditingProduct(null);
                } catch (err) {
                  console.error("❌ Error guardando producto:", err);
                  toast.error("No se pudo guardar el producto");
                }
              }}
            >
              {/* Nombre */}
              <label className="block mb-2">
                Nombre
                <input
                  type="text"
                  value={editingProduct.name || ""}
                  onChange={(e) =>
                    setEditingProduct((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="border w-full p-2 rounded mt-1"
                  required
                />
              </label>

              {/* Descripción */}
              <label className="block mb-2">
                Descripción
                <textarea
                  value={editingProduct.description || ""}
                  onChange={(e) =>
                    setEditingProduct((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="border w-full p-2 rounded mt-1"
                  required
                />
              </label>

              {/* Código */}
              <label className="block mb-2">
                Código
                <input
                  type="text"
                  value={editingProduct.productCode || ""}
                  onChange={(e) =>
                    setEditingProduct((prev) => ({
                      ...prev,
                      productCode: e.target.value,
                    }))
                  }
                  className="border w-full p-2 rounded mt-1"
                  required
                />
              </label>

              {/* Toggle: Precio fijo en ARS */}
              <label className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={!!editingProduct.fixedInARS}
                  onChange={(e) =>
                    setEditingProduct((prev) => ({
                      ...prev,
                      fixedInARS: e.target.checked,
                    }))
                  }
                />
                <span className="font-medium">Precio fijo en ARS</span>
              </label>

              {/* Precio (según modo) */}
              {editingProduct.fixedInARS ? (
                <>
                  {/* ARS requerido */}
                  <label className="block mb-2">
                    Precio (ARS)
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={
                        editingProduct.priceARS === null ||
                        editingProduct.priceARS === undefined
                          ? ""
                          : editingProduct.priceARS
                      }
                      onChange={(e) =>
                        setEditingProduct((prev) => ({
                          ...prev,
                          priceARS: e.target.value,
                        }))
                      }
                      className="border w-full p-2 rounded mt-1"
                      required
                    />
                  </label>

                  {/* USD opcional (referencia) */}
                  <label className="block mb-2">
                    Precio (USD) (opcional)
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={
                        editingProduct.priceUSD === null ||
                        editingProduct.priceUSD === undefined
                          ? ""
                          : editingProduct.priceUSD
                      }
                      onChange={(e) =>
                        setEditingProduct((prev) => ({
                          ...prev,
                          priceUSD: e.target.value,
                        }))
                      }
                      className="border w-full p-2 rounded mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Si lo dejás vacío, el producto solo tendrá precio en ARS.
                    </p>
                  </label>
                </>
              ) : (
                <>
                  {/* USD requerido */}
                  <label className="block mb-2">
                    Precio (USD)
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={
                        editingProduct.priceUSD === null ||
                        editingProduct.priceUSD === undefined
                          ? ""
                          : editingProduct.priceUSD
                      }
                      onChange={(e) =>
                        setEditingProduct((prev) => ({
                          ...prev,
                          priceUSD: e.target.value,
                        }))
                      }
                      className="border w-full p-2 rounded mt-1"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      El precio en ARS se recalcula automáticamente según la
                      cotización vigente al guardar.
                    </p>
                  </label>
                </>
              )}

              {/* Categoría (input + datalist) */}
              <label className="block mb-2">
                Categoría
                <input
                  list="dl-categories"
                  placeholder="Escribí o elegí una categoría…"
                  value={editingProduct.category || ""}
                  onChange={(e) =>
                    setEditingProduct((prev) => {
                      const nextCat = e.target.value;
                      return {
                        ...prev,
                        category: nextCat,
                        // al cambiar categoría, limpiar subcategoría
                        subcategory: "",
                      };
                    })
                  }
                  className="border w-full p-2 rounded mt-1"
                  required
                />
                <datalist id="dl-categories">
                  {categoryOptions.map((opt) => (
                    <option key={opt} value={opt} />
                  ))}
                </datalist>
              </label>

              {/* Subcategoría (input + datalist dependiente) */}
              <label className="block mb-4">
                Subcategoría
                <input
                  list="dl-subcategories"
                  placeholder="Escribí o elegí una subcategoría…"
                  value={editingProduct.subcategory || ""}
                  onChange={(e) =>
                    setEditingProduct((prev) => ({
                      ...prev,
                      subcategory: e.target.value,
                    }))
                  }
                  className="border w-full p-2 rounded mt-1"
                  disabled={!editingProduct.category}
                />
                <datalist id="dl-subcategories">
                  {subcategoryOptions.map((opt) => (
                    <option key={opt} value={opt} />
                  ))}
                </datalist>
              </label>

              {/* Imagen */}
              <label className="block mb-4">
                Imagen
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setEditingProduct((prev) => ({
                      ...prev,
                      imageFile: e.target.files?.[0],
                    }))
                  }
                  className="mt-1"
                />
              </label>

              {/* Botones */}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="bg-gray-400 text-white px-3 py-1 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProducts;
