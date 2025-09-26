import { useEffect, useState } from "react";
import API from "../api/axios";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    API.get("/products/admin/all")
      .then((res) => {
        if (Array.isArray(res.data.products)) {
          setProducts(res.data.products);
        } else if (Array.isArray(res.data)) {
          setProducts(res.data);
        } else {
          setProducts([]);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("¿Seguro que quieres eliminar este producto?")) return;

    try {
      await API.delete(`/products/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      console.error(
        "❌ Error al eliminar producto:",
        err.response?.data || err
      );
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await API.patch(
        `/products/${id}/toggle`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Reemplazar el producto en el array local
      setProducts(products.map((p) => (p._id === id ? res.data.product : p)));
    } catch (err) {
      console.error("❌ Error al cambiar estado:", err.response?.data || err);
    }
  };

  return (
    <div>
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gestión de productos</h2>
        <button
          className="bg-ayp text-white px-4 py-2 rounded hover:bg-ayp-dark"
          onClick={() =>
            setEditingProduct({ name: "", priceARS: 0, productCode: "" })
          }
        >
          ➕ Nuevo producto
        </button>
      </div>

      {/* Tabla */}
      <table className="w-full bg-white shadow rounded-lg overflow-hidden">
        <thead className="bg-ayp text-white">
          <tr>
            <th className="p-3 text-left">Imagen</th>
            <th className="p-3 text-left">Código</th>
            <th className="p-3 text-left">Nombre</th>
            <th className="p-3 text-left">Precio (ARS)</th>
            <th className="p-3 text-left">Estado</th>
            <th className="p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id} className="border-b">
              {/* Imagen */}
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

              {/* Código */}
              <td className="p-3">{p.productCode}</td>

              {/* Nombre */}
              <td className="p-3">{p.name}</td>

              {/* Precio */}
              <td className="p-3">
                {p.priceARS?.toLocaleString("es-AR", {
                  style: "currency",
                  currency: "ARS",
                })}
              </td>

              {/* Estado */}
              <td className="p-3">
                {p.active ? (
                  <span className="text-green-600 font-bold">Activo</span>
                ) : (
                  <span className="text-red-600 font-bold">Inactivo</span>
                )}
              </td>

              {/* Acciones */}
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
        </tbody>
      </table>

      {/* Modal de edición */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow w-96">
            <h3 className="text-lg font-bold mb-4">
              {editingProduct._id ? "Editar producto" : "Nuevo producto"}
            </h3>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const formData = new FormData();
                  formData.append("name", editingProduct.name);
                  formData.append("description", editingProduct.description);
                  formData.append("productCode", editingProduct.productCode);
                  formData.append("priceUSD", editingProduct.priceUSD);
                  formData.append("category", editingProduct.category);
                  if (editingProduct.imageFile) {
                    formData.append("image", editingProduct.imageFile);
                  }

                  let res;
                  if (editingProduct._id) {
                    // update
                    res = await API.put(
                      `/products/${editingProduct._id}`,
                      formData,
                      {
                        headers: {
                          Authorization: `Bearer ${localStorage.getItem(
                            "token"
                          )}`,
                          "Content-Type": "multipart/form-data",
                        },
                      }
                    );
                    setProducts(
                      products.map((p) =>
                        p._id === editingProduct._id ? res.data : p
                      )
                    );
                  } else {
                    // create
                    res = await API.post("/products", formData, {
                      headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                          "token"
                        )}`,
                        "Content-Type": "multipart/form-data",
                      },
                    });
                    setProducts([...products, res.data]);
                  }

                  setEditingProduct(null);
                } catch (err) {
                  console.error(
                    "❌ Error guardando producto:",
                    err.response?.data || err
                  );
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
                    setEditingProduct({
                      ...editingProduct,
                      name: e.target.value,
                    })
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
                    setEditingProduct({
                      ...editingProduct,
                      description: e.target.value,
                    })
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
                    setEditingProduct({
                      ...editingProduct,
                      productCode: e.target.value,
                    })
                  }
                  className="border w-full p-2 rounded mt-1"
                  required
                />
              </label>

              {/* Precio USD */}
              <label className="block mb-2">
                Precio (USD)
                <input
                  type="number"
                  step="0.01"
                  value={editingProduct.priceUSD ?? ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      priceUSD: e.target.value,
                    })
                  }
                  className="border w-full p-2 rounded mt-1"
                  required
                />
              </label>

              {/* Categoría */}
              <label className="block mb-4">
                Categoría
                <input
                  type="text"
                  value={editingProduct.category || ""}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      category: e.target.value,
                    })
                  }
                  className="border w-full p-2 rounded mt-1"
                  required
                />
              </label>

              {/* Imagen */}
              <label className="block mb-4">
                Imagen
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      imageFile: e.target.files[0],
                    })
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
