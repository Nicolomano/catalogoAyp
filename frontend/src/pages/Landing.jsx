import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronRight, Wrench, Phone, MapPin, Clock, Zap } from "lucide-react";
import API from "../api/axios";
import HeroCarousel from "../components/HeroCarousel.jsx";

const INFO_ICONS = [
  <Zap className="h-6 w-6" />,
  <Phone className="h-6 w-6" />,
  <Wrench className="h-6 w-6" />,
  <Clock className="h-6 w-6" />,
];

const DEFAULT_CONFIG = {
  infoCards: [
    { title: "Envíos rápidos",  desc: "A todo el país" },
    { title: "WhatsApp",        desc: "Cotizá al instante" },
    { title: "Precio service",  desc: "10% de descuento" },
    { title: "Horario",         desc: "Lun-Vie 8 a 18hs" },
  ],
  aboutTitle:  "¿Quiénes somos?",
  aboutText:   "A&P Refrigeración es un distribuidor mayorista de repuestos y equipos de refrigeración comercial e industrial. Más de 10 años en el rubro, atendiendo a instaladores y técnicos de todo el país.",
  address:     "Dirección del local, Ciudad, Provincia",
  phone:       "+54 11 XXXX-XXXX",
  hours:       "Lunes a Viernes de 8:00 a 18:00hs",
  kitTitle:    "Kit de instalación",
  kitSubtitle: "Calculá todo lo que necesitás para una instalación completa. Seleccioná los componentes y armá tu pedido en minutos.",
  kitCTA:      "Armar mi kit →",
};

function ProductCard({ product }) {
  return (
    <Link
      to={`/product/${product.productCode}`}
      className="bg-white rounded-xl shadow hover:shadow-lg transition group flex flex-col"
    >
      <div className="aspect-square flex items-center justify-center p-4 bg-gray-50 rounded-t-xl overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="object-contain max-h-full group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="text-gray-300 text-4xl">📦</div>
        )}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 flex-1">{product.name}</h3>
        {product.priceARS ? (
          <p className="text-base font-bold text-blue-700 mt-2">
            ${product.priceARS.toLocaleString("es-AR")}
          </p>
        ) : (
          <p className="text-sm text-gray-400 mt-2 italic">Consultar precio</p>
        )}
      </div>
    </Link>
  );
}

function SectionTitle({ title, linkTo, linkLabel }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl sm:text-2xl font-bold text-white">{title}</h2>
      {linkTo && (
        <Link
          to={linkTo}
          className="flex items-center gap-1 text-sm text-blue-200 hover:text-white transition"
        >
          {linkLabel} <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

function Landing() {
  const [landingData, setLandingData] = useState({ featured: [], newArrivals: [] });
  const [categories, setCategories] = useState([]);
  const [siteConfig, setSiteConfig] = useState(DEFAULT_CONFIG);

  useEffect(() => {
    API.get("/products/landing")
      .then((res) => setLandingData(res.data))
      .catch(() => {});

    API.get("/products/meta/categories")
      .then((res) => {
        const data = res.data || [];
        const normalized = data.length && typeof data[0] === "string"
          ? data.map((c) => ({ category: c, subcategories: [] }))
          : data;
        setCategories(normalized.slice(0, 8));
      })
      .catch(() => {});

    API.get("/site-config")
      .then((res) => setSiteConfig((prev) => ({ ...prev, ...res.data })))
      .catch(() => {});
  }, []);

  const { featured, newArrivals } = landingData;

  return (
    <>
      <Helmet>
        <title>A&P Refrigeración — Repuestos y equipos de refrigeración</title>
        <meta
          name="description"
          content="Catálogo A&P Refrigeración: productos y repuestos de refrigeración comercial e industrial. Envíos y cotización por WhatsApp."
        />
      </Helmet>

      <div className="min-h-screen bg-ayp">
        {/* Hero Carousel */}
        <HeroCarousel type="home" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-14">

          {/* Info rápida */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {siteConfig.infoCards.map((card, i) => (
              <div
                key={i}
                className="bg-white/10 rounded-xl p-4 flex flex-col items-center text-center gap-2 text-white"
              >
                {INFO_ICONS[i]}
                <span className="font-semibold text-sm">{card.title}</span>
                <span className="text-xs text-blue-200">{card.desc}</span>
              </div>
            ))}
          </div>

          {/* Categorías destacadas */}
          {categories.length > 0 && (
            <section>
              <SectionTitle
                title="Explorar por categoría"
                linkTo="/catalogo"
                linkLabel="Ver catálogo completo"
              />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {categories.map((cat) => (
                  <Link
                    key={cat.category}
                    to={`/catalogo?cat=${encodeURIComponent(cat.category)}`}
                    className="bg-white/10 hover:bg-white/20 rounded-xl p-4 text-center text-white transition group"
                  >
                    <div className="text-3xl mb-2">🔧</div>
                    <span className="text-sm font-medium group-hover:underline">
                      {cat.category}
                    </span>
                  </Link>
                ))}
                <Link
                  to="/catalogo"
                  className="bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl p-4 text-center text-white transition flex flex-col items-center justify-center gap-2"
                >
                  <span className="text-2xl">+</span>
                  <span className="text-sm">Ver todas</span>
                </Link>
              </div>
            </section>
          )}

          {/* Destacados */}
          {featured.length > 0 && (
            <section>
              <SectionTitle
                title="⭐ Destacados"
                linkTo="/catalogo"
                linkLabel="Ver todos"
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {featured.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            </section>
          )}

          {/* Nuevos ingresos */}
          {newArrivals.length > 0 && (
            <section>
              <SectionTitle
                title="🆕 Nuevos ingresos"
                linkTo="/catalogo?sort=createdAt:desc"
                linkLabel="Ver todos"
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {newArrivals.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            </section>
          )}

          {/* Kit de instalación CTA */}
          <section className="bg-white/10 rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-6">
            <div className="text-5xl">🔧</div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold text-white mb-2">{siteConfig.kitTitle}</h2>
              <p className="text-blue-200 text-sm">{siteConfig.kitSubtitle}</p>
            </div>
            <Link
              to="/kit-instalacion"
              className="bg-white text-blue-700 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition whitespace-nowrap"
            >
              {siteConfig.kitCTA}
            </Link>
          </section>

          {/* Info del local */}
          <section className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white/10 rounded-2xl p-6 text-white">
              <h2 className="text-lg font-bold mb-4">{siteConfig.aboutTitle}</h2>
              <p className="text-blue-100 text-sm leading-relaxed">{siteConfig.aboutText}</p>
              <Link
                to="/contacto"
                className="inline-flex items-center gap-1 mt-4 text-sm text-blue-200 hover:text-white"
              >
                Contactanos <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="bg-white/10 rounded-2xl p-6 text-white space-y-3">
              <h2 className="text-lg font-bold mb-4">Información</h2>
              <div className="flex items-start gap-3 text-sm text-blue-100">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{siteConfig.address}</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-blue-100">
                <Phone className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{siteConfig.phone}</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-blue-100">
                <Clock className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{siteConfig.hours}</span>
              </div>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}

export default Landing;
