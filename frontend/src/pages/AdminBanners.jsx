import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

const AUTH = { Authorization: `Bearer ${localStorage.getItem("token")}` };

export default function AdminBanners() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [typeFilter, setTypeFilter] = useState("home");

  const fetchAll = () => {
    API.get("/banners/admin/all", {
      headers: AUTH,
      params: { type: typeFilter },
    })
      .then((res) => setItems(res.data || []))
      .catch((e) => console.error(e));
  };

  useEffect(() => {
    fetchAll();
  }, [typeFilter]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append("title", editing.title || "");
      fd.append("subtitle", editing.subtitle || "");
      fd.append("linkUrl", editing.linkUrl || "");
      fd.append("type", editing.type || "home");
      fd.append("order", String(editing.order ?? 0));
      fd.append("active", String(!!editing.active));
      if (editing.imageFile) fd.append("image", editing.imageFile);

      let res;
      if (editing._id) {
        res = await API.put(`/banners/${editing._id}`, fd, {
          headers: { ...AUTH, "Content-Type": "multipart/form-data" },
        });
        setItems((prev) =>
          prev.map((i) => (i._id === editing._id ? res.data : i))
        );
        toast.success("Banner actualizado");
      } else {
        res = await API.post("/banners", fd, {
          headers: { ...AUTH, "Content-Type": "multipart/form-data" },
        });
        setItems((prev) => [res.data, ...prev]);
        toast.success("Banner creado");
      }
      setEditing(null);
    } catch (e) {
      console.error(e);
      toast.error("No se pudo guardar");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar banner?")) return;
    await API.delete(`/banners/${id}`, { headers: AUTH });
    setItems((prev) => prev.filter((i) => i._id !== id));
    toast.success("Banner eliminado");
  };

  const handleToggle = async (id) => {
    const res = await API.patch(`/banners/${id}/toggle`, {}, { headers: AUTH });
    setItems((prev) => prev.map((i) => (i._id === id ? res.data.banner : i)));
  };

  const handleReorder = async () => {
    const ids = items.map((i) => i._id);
    await API.patch("/banners/reorder", { ids }, { headers: AUTH });
    toast.success("Orden actualizado");
    fetchAll();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Banners / Slider</h2>
        <div className="flex gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="home">Home (hero)</option>
            <option value="catalog">Catálogo (sección)</option>
          </select>
          <button
            className="bg-ayp text-white px-4 py-2 rounded"
            onClick={() =>
              setEditing({
                title: "",
                subtitle: "",
                linkUrl: "",
                type: typeFilter,
                order: items.length,
                active: true,
              })
            }
          >
            ➕ Nuevo banner
          </button>
        </div>
      </div>

      <table className="w-full bg-white shadow rounded-lg overflow-hidden">
        <thead className="bg-ayp text-white">
          <tr>
            <th className="p-3 text-left">Imagen</th>
            <th className="p-3 text-left">Título</th>
            <th className="p-3 text-left">Tipo</th>
            <th className="p-3 text-left">Orden</th>
            <th className="p-3 text-left">Estado</th>
            <th className="p-3">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((b) => (
            <tr key={b._id} className="border-b">
              <td className="p-3">
                {b.image ? (
                  <img
                    src={b.image}
                    alt={b.title}
                    className="w-24 h-16 object-cover rounded"
                  />
                ) : (
                  "-"
                )}
              </td>
              <td className="p-3">{b.title || "-"}</td>
              <td className="p-3">{b.type}</td>
              <td className="p-3">{b.order}</td>
              <td className="p-3">{b.active ? "Activo" : "Inactivo"}</td>
              <td className="p-3 flex gap-2">
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                  onClick={() => setEditing(b)}
                >
                  Editar
                </button>
                <button
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                  onClick={() => handleToggle(b._id)}
                >
                  {b.active ? "Desactivar" : "Activar"}
                </button>
                <button
                  className="bg-red-600 text-white px-3 py-1 rounded"
                  onClick={() => handleDelete(b._id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan="6" className="p-6 text-center text-gray-500">
                No hay banners.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {items.length > 1 && (
        <div className="flex justify-end">
          <button
            className="bg-gray-800 text-white px-4 py-2 rounded"
            onClick={handleReorder}
          >
            Guardar orden actual
          </button>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/50 grid place-items-center z-50">
          <div className="bg-white p-6 rounded shadow w-[560px] max-w-[95vw]">
            <h3 className="text-lg font-bold mb-4">
              {editing._id ? "Editar banner" : "Nuevo banner"}
            </h3>
            <form onSubmit={handleSave} className="space-y-3">
              <label className="block">
                Título
                <input
                  type="text"
                  value={editing.title || ""}
                  onChange={(e) =>
                    setEditing((p) => ({ ...p, title: e.target.value }))
                  }
                  className="border w-full p-2 rounded mt-1"
                />
              </label>
              <label className="block">
                Subtítulo
                <input
                  type="text"
                  value={editing.subtitle || ""}
                  onChange={(e) =>
                    setEditing((p) => ({ ...p, subtitle: e.target.value }))
                  }
                  className="border w-full p-2 rounded mt-1"
                />
              </label>
              <label className="block">
                Link (opcional)
                <input
                  type="url"
                  value={editing.linkUrl || ""}
                  onChange={(e) =>
                    setEditing((p) => ({ ...p, linkUrl: e.target.value }))
                  }
                  className="border w-full p-2 rounded mt-1"
                  placeholder="https://..."
                />
              </label>

              <div className="flex gap-3">
                <label className="block flex-1">
                  Tipo
                  <select
                    value={editing.type || "home"}
                    onChange={(e) =>
                      setEditing((p) => ({ ...p, type: e.target.value }))
                    }
                    className="border w-full p-2 rounded mt-1"
                  >
                    <option value="home">Home (hero)</option>
                    <option value="catalog">Catálogo (sección)</option>
                  </select>
                </label>
                <label className="block w-32">
                  Orden
                  <input
                    type="number"
                    value={editing.order ?? 0}
                    onChange={(e) =>
                      setEditing((p) => ({
                        ...p,
                        order: Number(e.target.value),
                      }))
                    }
                    className="border w-full p-2 rounded mt-1"
                  />
                </label>
                <label className="block w-36">
                  Estado
                  <select
                    value={editing.active ? "1" : "0"}
                    onChange={(e) =>
                      setEditing((p) => ({
                        ...p,
                        active: e.target.value === "1",
                      }))
                    }
                    className="border w-full p-2 rounded mt-1"
                  >
                    <option value="1">Activo</option>
                    <option value="0">Inactivo</option>
                  </select>
                </label>
              </div>

              <label className="block">
                Imagen
                <div className="mt-1 flex items-center gap-3">
                  {editing.image && !editing.imageFile && (
                    <img
                      src={editing.image}
                      alt="preview"
                      className="w-28 h-16 object-cover rounded border"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setEditing((p) => ({
                        ...p,
                        imageFile: e.target.files?.[0],
                      }))
                    }
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Recomendado: 1800×600 (3:1)
                </p>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="bg-gray-400 text-white px-3 py-1 rounded"
                  onClick={() => setEditing(null)}
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
