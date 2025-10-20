// src/pages/KitInstalacion.jsx
import { useEffect, useMemo, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

const stepperClamp = (n, step = 0.5) =>
  Math.max(0, Math.round(n / step) * step);

export default function KitInstalacion() {
  const [meta, setMeta] = useState([]);
  const [qty, setQty] = useState({});
  const [variant, setVariant] = useState({}); // variantes por item.key
  const [pricing, setPricing] = useState({ lines: [], total: 0 });
  const [loading, setLoading] = useState(false);

  // ─────────────────────────────────────────────
  // Cargar metadata (items + defaults)
  useEffect(() => {
    API.get("/kits/install/meta")
      .then((res) => {
        const items = res.data.items || [];
        setMeta(items);

        // defaults de cantidades y variantes
        const initialQty = {};
        const initialVar = {};
        items.forEach((it) => {
          initialQty[it.key] = it.defaultQty ?? 0;
          if (Array.isArray(it.variants) && it.variants.length) {
            initialVar[it.key] = it.variants[0].value; // 1ra variante como default
          }
        });
        setQty(initialQty);
        setVariant(initialVar);
      })
      .catch(() => toast.error("No se pudo cargar el kit"));
  }, []);

  // ─────────────────────────────────────────────
  // Exclusión: patas de ménsula vs piso
  const handleQty = (key, value) => {
    const item = meta.find((i) => i.key === key);
    const step = item?.step || 0.5;
    const v = stepperClamp(Number(value || 0), step);

    setQty((prev) => {
      const next = { ...prev, [key]: v };
      if (key === "feet_bracket" && v > 0) next["feet_floor"] = 0;
      if (key === "feet_floor" && v > 0) next["feet_bracket"] = 0;
      return next;
    });
  };

  const handleVariant = (key, value) => {
    setVariant((prev) => ({ ...prev, [key]: value }));
  };

  // ─────────────────────────────────────────────
  // Calcular precio en backend
  const fetchPrice = async () => {
    try {
      setLoading(true);
      const res = await API.post("/kits/install/price", {
        quantities: qty,
        variant, // ← enviar variantes de TODOS los ítems
      });
      setPricing(res.data);
    } catch {
      toast.error("No se pudo calcular el precio");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (meta.length) fetchPrice();
  }, [meta.length]); // primera vez

  useEffect(() => {
    if (meta.length) fetchPrice();
  }, [qty, variant, meta.length]); // recalcular al cambiar qty o variantes

  // ─────────────────────────────────────────────
  // Texto para WhatsApp
  const waText = useMemo(() => {
    const lines = pricing.lines
      .map((l) => {
        const varLabel = l.variant
          ? ` (${l.key === "bracket" ? `${l.variant} cm` : l.variant})`
          : "";
        return `• ${l.label}${varLabel}: ${l.qty} ${
          l.unit
        } — $${l.unitPriceARS.toLocaleString("es-AR")} c/u`;
      })
      .join("%0A");

    return `Hola! Quiero cotizar el siguiente kit de instalación:%0A${lines}%0A%0ATotal: $${pricing.total.toLocaleString(
      "es-AR"
    )}`;
  }, [pricing]);

  // ─────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-white">Kit de instalación</h1>
      <p className="text-gray-200">
        Ajustá cantidades (paso 0.5) y elegí las variantes. El total se calcula
        automáticamente.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-black">
        {/* Configurador */}
        <section className="bg-white rounded-xl shadow p-6 space-y-4">
          {!meta.length ? (
            <div className="text-gray-500">Configuración no encontrada.</div>
          ) : (
            meta.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>

                  {/* Selector de variante (genérico) */}
                  {Array.isArray(item.variants) && item.variants.length > 0 && (
                    <div className="text-sm text-gray-600 mt-1">
                      {item.key === "copper_small" || item.key === "copper_big"
                        ? "Medida:"
                        : item.key === "cable"
                        ? "Sección:"
                        : item.key === "insulation"
                        ? "Para caños:"
                        : item.key === "bracket"
                        ? "Tamaño:"
                        : "Variante:"}
                      <select
                        value={variant[item.key] || item.variants[0].value}
                        onChange={(e) =>
                          handleVariant(item.key, e.target.value)
                        }
                        className="ml-2 border rounded px-2 py-1"
                      >
                        {item.variants.map((v) => (
                          <option key={v.value} value={v.value}>
                            {v.value}
                            {item.key === "bracket" ? " cm" : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Stepper de cantidad */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleQty(
                        item.key,
                        (qty[item.key] || 0) - (item.step || 0.5)
                      )
                    }
                    className="px-2 py-1 border rounded"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    step={item.step || 0.5}
                    min="0"
                    value={qty[item.key] ?? 0}
                    onChange={(e) => handleQty(item.key, e.target.value)}
                    className="w-24 border rounded px-2 py-1 text-right"
                  />
                  <button
                    onClick={() =>
                      handleQty(
                        item.key,
                        (qty[item.key] || 0) + (item.step || 0.5)
                      )
                    }
                    className="px-2 py-1 border rounded"
                  >
                    +
                  </button>
                  <span className="w-8 text-right text-gray-500">
                    {item.unit}
                  </span>
                </div>
              </div>
            ))
          )}
        </section>

        {/* Resumen */}
        <section className="bg-white rounded-xl shadow p-6 space-y-3">
          <h2 className="text-lg font-semibold">Resumen</h2>
          {loading ? (
            <div className="text-gray-500">Calculando…</div>
          ) : pricing.lines.length ? (
            <>
              <ul className="divide-y">
                {pricing.lines.map((l) => (
                  <li
                    key={l.key}
                    className="py-2 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium">
                        {l.label}
                        {l.variant
                          ? ` (${
                              l.key === "bracket"
                                ? `${l.variant} cm`
                                : l.variant
                            })`
                          : ""}
                      </div>
                      <div className="text-sm text-gray-500">
                        {l.qty} {l.unit} × $
                        {l.unitPriceARS.toLocaleString("es-AR")}
                      </div>
                    </div>
                    <div className="font-semibold">
                      ${l.subtotal.toLocaleString("es-AR")}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="pt-3 border-t flex items-center justify-between">
                <span className="text-gray-600">Total</span>
                <span className="text-xl font-bold">
                  ${pricing.total.toLocaleString("es-AR")}
                </span>
              </div>
              <div className="flex gap-2">
                <a
                  href={`https://wa.me/5491168815837?text=${waText}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 text-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Enviar por WhatsApp
                </a>
              </div>
            </>
          ) : (
            <div className="text-gray-500">
              Elegí cantidades para ver el total.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
