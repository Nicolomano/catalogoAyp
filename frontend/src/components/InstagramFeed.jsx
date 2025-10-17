import { useEffect } from "react";

// columns: { base: 1, md: 3 } define columnas responsivas con Tailwind
export default function InstagramFeed({
  postUrls = [],
  columns = { base: 1, md: 3 },
}) {
  useEffect(() => {
    // Cargar script de Instagram si no existe
    const id = "ig-embed-script";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.id = id;
      s.async = true;
      s.src = "https://www.instagram.com/embed.js";
      document.body.appendChild(s);
    } else if (window.instgrm?.Embeds) {
      // Reprocesar si ya existe
      window.instgrm.Embeds.process();
    }
  }, [postUrls]);

  const gridClasses = [
    "grid gap-4",
    `grid-cols-${Math.min(4, Math.max(1, columns.base || 1))}`,
    `md:grid-cols-${Math.min(4, Math.max(1, columns.md || columns.base || 1))}`,
  ].join(" ");

  return (
    <div className={gridClasses}>
      {postUrls.map((url) => (
        <div key={url} className="bg-white rounded-lg overflow-hidden">
          {/* Blockquote/iframe que el script reemplaza */}
          <blockquote
            className="instagram-media"
            data-instgrm-permalink={url}
            data-instgrm-version="14"
            style={{
              background: "#fff",
              border: 0,
              margin: 0,
              padding: 0,
              width: "100%",
            }}
          />
        </div>
      ))}
    </div>
  );
}
