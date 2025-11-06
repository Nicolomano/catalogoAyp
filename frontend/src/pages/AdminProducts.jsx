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

  /* -------------------- Cargar categorías -------------------- */
  useEffect(() => {
    API.get("/products/meta/categories")
      .then((res) => {
        const data = res.data || [];

        // 🔹 Normalizar formato
        const cats = data.map((item) => {
          if (typeof item === "string") {
            return { category: item, subcategories: [] };
          } else if (item.category || item._id) {
            return {
              category: item.category || item._id || "",
              subcategories: Array.isArray(item.subcategories)
                ? item.subcategories.flat().filter(Boolean)
                : [],
            };
          } else {
            return { category: "", subcategories: [] };
          }
        });

        setCategories(cats);

        // Actualizar subcategorías si hay categoría activa
        if (category !== "all") {
          const found = cats.find((c) => c.category === category);
          setSubcategories(found ? found.subcategories : []);
        }
      })
      .catch((e) => console.error("Error meta categorías:", e));
  }, []);

  useEffect(() => {
    const found = categories.find((c) => c.category === category);
    setSubcategories(found ? found.subcategories : []);
    setSubcategory("all");
  }, [category, categories]);

  /* -------------------- Debounce búsqueda -------------------- */
  const debouncedSearch = useMemo(() => {
    let t;
    return (value, cb) => {
      clearTimeout(t);
      t = setTimeout(() => cb(value), 400);
    };
  }, []);

  /* -------------------- Fetch productos -------------------- */
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

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchProducts({});
  }, [category, subcategory, sort]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    debouncedSearch(value, (v) => {
      fetchProducts({ searchParam: v });
    });
  };

  /* -------------------- Eliminar / Toggle -------------------- */
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

  /* -------------------- UI -------------------- */
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
          <input
            type="text"
            placeholder="Buscar por nombre o código..."
            value={search}
            onChange={handleSearchChange}
            className="border rounded px-3 py-2 md:w-72"
          />

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

          <button
            className="bg-ayp text-white px-4 py-2 rounded hover:bg-ayp-dark"
            onClick={() =>
              setEditingProduct({
                name: "",
                description: "",
                priceUSD: 0,
                priceARS: "",
                fixedInARS: false,
                categories: [],
                subcategories: [],
                productCode: "",
              })
            }
          >
            ➕ Nuevo producto
          </button>
          <button
            onClick={() => {
              window.open(
                `${API.defaults.baseURL}/products/export/excel`,
                "_blank"
              );
            }}
            className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800"
          >
            📤 Exportar productos (CSV)
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
              <th className="p-3 text-left">Categorías</th>
              <th className="p-3 text-left">Subcategorías</th>
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
                <td className="p-3">
                  {Array.isArray(p.categories) && p.categories.length
                    ? p.categories.join(", ")
                    : "-"}
                </td>
                <td className="p-3">
                  {Array.isArray(p.subcategories) && p.subcategories.length
                    ? p.subcategories.join(", ")
                    : "-"}
                </td>
                <td className="p-3">
                  {p.priceARS
                    ? Number(p.priceARS).toLocaleString("es-AR", {
                        style: "currency",
                        currency: "ARS",
                      })
                    : "-"}
                </td>
                <td className="p-3">
                  {p.priceUSD
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

      {/* Modal */}
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
                  const norm = (s) => (s || "").trim().replace(/\s+/g, " ");
                  formData.append("name", norm(editingProduct.name));
                  formData.append(
                    "description",
                    norm(editingProduct.description)
                  );
                  formData.append(
                    "productCode",
                    norm(editingProduct.productCode)
                  );

                  // precios
                  if (editingProduct.fixedInARS) {
                    if (editingProduct.priceARS)
                      formData.append("priceARS", editingProduct.priceARS);
                    if (editingProduct.priceUSD)
                      formData.append("priceUSD", editingProduct.priceUSD);
                  } else {
                    if (editingProduct.priceUSD)
                      formData.append("priceUSD", editingProduct.priceUSD);
                  }
                  formData.append(
                    "fixedInARS",
                    editingProduct.fixedInARS ? "true" : "false"
                  );

                  // múltiples categorías
                  if (editingProduct.categories?.length) {
                    editingProduct.categories.forEach((cat) =>
                      formData.append("categories[]", cat)
                    );
                  }
                  if (editingProduct.subcategories?.length) {
                    editingProduct.subcategories.forEach((sub) =>
                      formData.append("subcategories[]", sub)
                    );
                  }

                  if (editingProduct.imageFile)
                    formData.append("image", editingProduct.imageFile);

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
              {/* Campos básicos */}
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

              {editingProduct.fixedInARS ? (
                <>
                  <label className="block mb-2">
                    Precio (ARS)
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editingProduct.priceARS || ""}
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
                  <label className="block mb-2">
                    Precio (USD) (opcional)
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editingProduct.priceUSD || ""}
                      onChange={(e) =>
                        setEditingProduct((prev) => ({
                          ...prev,
                          priceUSD: e.target.value,
                        }))
                      }
                      className="border w-full p-2 rounded mt-1"
                    />
                  </label>
                </>
              ) : (
                <label className="block mb-2">
                  Precio (USD)
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingProduct.priceUSD || ""}
                    onChange={(e) =>
                      setEditingProduct((prev) => ({
                        ...prev,
                        priceUSD: e.target.value,
                      }))
                    }
                    className="border w-full p-2 rounded mt-1"
                    required
                  />
                </label>
              )}

              {/* Categorías múltiples */}
              {/* Categorías con chips */}
              <label className="block mb-4">
                <span className="font-medium">Categorías</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {categories.map((c) => {
                    const selected = editingProduct.categories?.includes(
                      c.category
                    );
                    return (
                      <button
                        key={c.category}
                        type="button"
                        onClick={() => {
                          setEditingProduct((prev) => {
                            const already = prev.categories?.includes(
                              c.category
                            );
                            const nextCats = already
                              ? prev.categories.filter((x) => x !== c.category)
                              : [...(prev.categories || []), c.category];
                            return {
                              ...prev,
                              categories: nextCats,
                              subcategories: [],
                            };
                          });
                        }}
                        className={`px-3 py-1 rounded-full border text-sm ${
                          selected
                            ? "bg-ayp text-white border-ayp"
                            : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {c.category}
                      </button>
                    );
                  })}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Podés seleccionar una o varias categorías.
                </p>
              </label>

              {/* Subcategorías múltiples */}
              {editingProduct.categories?.length > 0 && (
                <label className="block mb-4">
                  <span className="font-medium">Subcategorías</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {editingProduct.categories.map((cat) => {
                      const found = categories.find((c) => c.category === cat);
                      return found?.subcategories?.map((s) => {
                        const selected =
                          editingProduct.subcategories?.includes(s);
                        return (
                          <button
                            key={`${cat}-${s}`}
                            type="button"
                            onClick={() => {
                              setEditingProduct((prev) => {
                                const already = prev.subcategories?.includes(s);
                                const nextSubs = already
                                  ? prev.subcategories.filter((x) => x !== s)
                                  : [...(prev.subcategories || []), s];
                                return { ...prev, subcategories: nextSubs };
                              });
                            }}
                            className={`px-3 py-1 rounded-full border text-sm ${
                              selected
                                ? "bg-green-600 text-white border-green-600"
                                : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {s}{" "}
                            <span className="text-xs opacity-70">({cat})</span>
                          </button>
                        );
                      });
                    })}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Las subcategorías dependen de las categorías seleccionadas.
                  </p>
                </label>
              )}

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
