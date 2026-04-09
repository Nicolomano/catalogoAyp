import { useEffect, useState } from "react";
import API from "../api/axios";

const DEFAULT_CONFIG = {
  infoCards: [
    { title: "Envíos rápidos",  desc: "A todo el país" },
    { title: "WhatsApp",        desc: "Cotizá al instante" },
    { title: "Precio service",  desc: "10% de descuento" },
    { title: "Horario",         desc: "Lun-Vie 8 a 18hs" },
  ],
  aboutTitle:  "¿Quiénes somos?",
  aboutText:   "",
  address:     "",
  phone:       "",
  hours:       "",
  kitTitle:    "Kit de instalación",
  kitSubtitle: "",
  kitCTA:      "Armar mi kit →",
};

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const textareaCls = `${inputCls} resize-none`;

export default function AdminLanding() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState(null); // { type: "ok"|"err", text }

  useEffect(() => {
    API.get("/site-config").then((res) => {
      setConfig((prev) => ({ ...prev, ...res.data }));
    });
  }, []);

  const handleCard = (idx, field, value) => {
    setConfig((prev) => {
      const cards = [...prev.infoCards];
      cards[idx] = { ...cards[idx], [field]: value };
      return { ...prev, infoCards: cards };
    });
  };

  const handleField = (field, value) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      await API.put("/site-config", config);
      setMsg({ type: "ok", text: "¡Guardado correctamente!" });
    } catch {
      setMsg({ type: "err", text: "Error al guardar. Intentá de nuevo." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Configuración de la página</h1>
        <button
          onClick={save}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg text-sm disabled:opacity-50 transition"
        >
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>

      {msg && (
        <div className={`rounded-lg px-4 py-3 text-sm font-medium ${msg.type === "ok" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {msg.text}
        </div>
      )}

      {/* Tarjetas de info rápida */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-800">Tarjetas de inicio</h2>
        <p className="text-xs text-gray-500">Las 4 tarjetas que aparecen debajo del carrusel (envíos, WhatsApp, etc.).</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {config.infoCards.map((card, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-2 bg-gray-50">
              <Field label={`Título tarjeta ${i + 1}`}>
                <input
                  className={inputCls}
                  value={card.title}
                  onChange={(e) => handleCard(i, "title", e.target.value)}
                />
              </Field>
              <Field label="Descripción">
                <input
                  className={inputCls}
                  value={card.desc}
                  onChange={(e) => handleCard(i, "desc", e.target.value)}
                />
              </Field>
            </div>
          ))}
        </div>
      </section>

      {/* Quiénes somos */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-800">¿Quiénes somos?</h2>
        <Field label="Título">
          <input
            className={inputCls}
            value={config.aboutTitle}
            onChange={(e) => handleField("aboutTitle", e.target.value)}
          />
        </Field>
        <Field label="Texto">
          <textarea
            rows={4}
            className={textareaCls}
            value={config.aboutText}
            onChange={(e) => handleField("aboutText", e.target.value)}
          />
        </Field>
      </section>

      {/* Información de contacto */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-800">Información de contacto</h2>
        <Field label="Dirección">
          <input
            className={inputCls}
            value={config.address}
            onChange={(e) => handleField("address", e.target.value)}
          />
        </Field>
        <Field label="Teléfono / WhatsApp">
          <input
            className={inputCls}
            value={config.phone}
            onChange={(e) => handleField("phone", e.target.value)}
          />
        </Field>
        <Field label="Horario de atención">
          <input
            className={inputCls}
            value={config.hours}
            onChange={(e) => handleField("hours", e.target.value)}
          />
        </Field>
      </section>

      {/* Kit de instalación */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-800">Sección Kit de instalación</h2>
        <Field label="Título">
          <input
            className={inputCls}
            value={config.kitTitle}
            onChange={(e) => handleField("kitTitle", e.target.value)}
          />
        </Field>
        <Field label="Descripción">
          <textarea
            rows={3}
            className={textareaCls}
            value={config.kitSubtitle}
            onChange={(e) => handleField("kitSubtitle", e.target.value)}
          />
        </Field>
        <Field label="Texto del botón">
          <input
            className={inputCls}
            value={config.kitCTA}
            onChange={(e) => handleField("kitCTA", e.target.value)}
          />
        </Field>
      </section>

      {/* Botón guardar al pie también */}
      <div className="flex justify-end pb-6">
        <button
          onClick={save}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm disabled:opacity-50 transition"
        >
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}
