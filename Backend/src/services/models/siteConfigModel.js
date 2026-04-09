import mongoose from "mongoose";

const siteConfigSchema = new mongoose.Schema(
  {
    // Tarjetas de info rápida
    infoCards: {
      type: [
        {
          title: { type: String, default: "" },
          desc:  { type: String, default: "" },
        },
      ],
      default: [
        { title: "Envíos rápidos",  desc: "A todo el país" },
        { title: "WhatsApp",        desc: "Cotizá al instante" },
        { title: "Precio service",  desc: "10% de descuento" },
        { title: "Horario",         desc: "Lun-Vie 8 a 18hs" },
      ],
    },
    // Sección quiénes somos
    aboutTitle: { type: String, default: "¿Quiénes somos?" },
    aboutText: {
      type: String,
      default:
        "A&P Refrigeración es un distribuidor mayorista de repuestos y equipos de refrigeración comercial e industrial. Más de 10 años en el rubro, atendiendo a instaladores y técnicos de todo el país.",
    },
    // Datos de contacto / info
    address: { type: String, default: "Dirección del local, Ciudad, Provincia" },
    phone:   { type: String, default: "+54 11 XXXX-XXXX" },
    hours:   { type: String, default: "Lunes a Viernes de 8:00 a 18:00hs" },
    // CTA del kit
    kitTitle:    { type: String, default: "Kit de instalación" },
    kitSubtitle: {
      type: String,
      default:
        "Calculá todo lo que necesitás para una instalación completa. Seleccioná los componentes y armá tu pedido en minutos.",
    },
    kitCTA: { type: String, default: "Armar mi kit →" },
  },
  { timestamps: true }
);

// Siempre hay un único documento; usamos singleton_key para upsert
siteConfigSchema.index({ singleton_key: 1 }, { unique: true, sparse: true });

export default mongoose.model("siteConfig", siteConfigSchema);
