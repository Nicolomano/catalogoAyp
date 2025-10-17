import InstagramFeed from "../components/InstagramFeed";

// 🔧 Reemplazá estos valores o levantalos desde un Config/API:
const PHONE_E164 = "+5491168815837"; // formato +549...
const PHONE_HUMAN = "11-6881-5837";
const WHATSAPP_MSG = "Hola! Quisiera consultar por un producto del catálogo.";
const ADDRESS_LABEL =
  "Av. Sesquicentenario 2144, Los Polvorines, Buenos Aires, Argentina";
const MAPS_EMBED_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1805.392754035019!2d-58.70720023760755!3d-34.49696692198153!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bca36c372e2b0d%3A0x5aa0aed941af813a!2sRefrigeraci%C3%B3n%20A%26P!5e0!3m2!1ses-419!2sar!4v1760707801941!5m2!1ses-419!2sar";
const EMAIL = "refrigeracionap80@gmail.com";

export default function Contacto() {
  const waHref = `https://wa.me/${PHONE_E164.replace(
    /\D/g,
    ""
  )}?text=${encodeURIComponent(WHATSAPP_MSG)}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold">Contacto</h1>

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card: Datos de contacto */}
        <section className="bg-white rounded-xl shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold">Hablemos</h2>

          <div className="space-y-2 text-gray-700">
            <div className="flex items-center gap-2">
              <span className="font-medium w-28">Teléfono:</span>
              <a
                href={`tel:${PHONE_E164}`}
                className="text-blue-600 hover:underline"
              >
                {PHONE_HUMAN}
              </a>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium w-28">WhatsApp:</span>
              <a
                href={waHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded bg-green-600 text-white px-3 py-1.5 hover:bg-green-700"
              >
                Escribir por WhatsApp
              </a>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium w-28">Email:</span>
              <a
                href={`mailto:${EMAIL}`}
                className="text-blue-600 hover:underline"
              >
                {EMAIL}
              </a>
            </div>

            <div className="flex items-start gap-2">
              <span className="font-medium w-28">Dirección:</span>
              <span>{ADDRESS_LABEL}</span>
            </div>
          </div>
        </section>

        {/* Card: Mapa */}
        <section className="bg-white rounded-xl shadow overflow-hidden">
          <div className="aspect-[4/3] w-full">
            <iframe
              src={MAPS_EMBED_SRC}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full border-0"
              title="Ubicación A&P Refrigeración"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
