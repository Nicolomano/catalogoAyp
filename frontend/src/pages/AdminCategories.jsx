import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { PlusCircle, Trash2 } from "lucide-react";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newCat, setNewCat] = useState({ name: "", slug: "", parent: "" });

  /* -------------------- CARGAR CATEGORÍAS -------------------- */
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await API.get("/categories/tree");
      setCategories(res.data);
    } catch {
      toast.error("No se pudieron cargar las categorías");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* -------------------- CREAR CATEGORÍA -------------------- */
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCat.name || !newCat.slug)
      return toast.error("Completá nombre y slug");

    try {
      await API.post("/categories", newCat);
      toast.success("Categoría creada con éxito");
      setNewCat({ name: "", slug: "", parent: "" });
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error al crear categoría");
    }
  };

  /* -------------------- ELIMINAR CATEGORÍA -------------------- */
  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar esta categoría?")) return;
    try {
      await API.delete(`/categories/${id}`);
      toast.success("Categoría eliminada");
      fetchCategories();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "No se pudo eliminar la categoría"
      );
    }
  };

  /* -------------------- RENDERIZAR ÁRBOL -------------------- */
  const renderTree = (nodes, level = 0) => {
    return nodes.map((cat) => (
      <div
        key={cat._id}
        className="pl-3 border-l border-gray-300 mb-1 ml-2"
        style={{ marginLeft: `${level * 10}px` }}
      >
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-800">{cat.name}</span>
            <span className="text-sm text-gray-500">/{cat.slug}</span>
          </div>
          <button
            onClick={() => handleDelete(cat._id)}
            className="text-red-500 hover:text-red-700"
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
        {cat.children?.length > 0 && renderTree(cat.children, level + 1)}
      </div>
    ));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Categorías y Subcategorías</h1>
      <p className="text-gray-600">
        Crea y organiza categorías jerárquicamente. Las subcategorías se crean
        eligiendo una categoría padre.
      </p>

      {/* FORMULARIO */}
      <form
        onSubmit={handleCreate}
        className="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row gap-3 items-center"
      >
        <input
          type="text"
          placeholder="Nombre"
          className="border rounded px-3 py-2 flex-1"
          value={newCat.name}
          onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Slug (sin espacios, en minúscula)"
          className="border rounded px-3 py-2 flex-1"
          value={newCat.slug}
          onChange={(e) => setNewCat({ ...newCat, slug: e.target.value })}
        />
        <select
          className="border rounded px-3 py-2"
          value={newCat.parent}
          onChange={(e) => setNewCat({ ...newCat, parent: e.target.value })}
        >
          <option value="">Sin categoría padre</option>
          {categories.flatMap((c) => [
            <option key={c._id} value={c._id}>
              {c.name}
            </option>,
            ...(c.children || []).map((sc) => (
              <option key={sc._id} value={sc._id}>
                └ {sc.name}
              </option>
            )),
          ])}
        </select>
        <button
          type="submit"
          className="bg-blue-600 text-white rounded px-4 py-2 flex items-center gap-1 hover:bg-blue-700"
        >
          <PlusCircle size={18} /> Crear
        </button>
      </form>

      {/* LISTA */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-2">Estructura actual</h2>
        {loading ? (
          <div className="text-gray-500">Cargando categorías...</div>
        ) : categories.length ? (
          <div className="space-y-1">{renderTree(categories)}</div>
        ) : (
          <div className="text-gray-500">No hay categorías creadas</div>
        )}
      </div>
    </div>
  );
}
