# Catálogo A&P · primera versión

Primer catálogo online de **A&P Refrigeración**, una casa de repuestos de refrigeración de
Buenos Aires: catálogo público, carrito con pedido por WhatsApp, precios en dólares
convertidos a pesos según la cotización y panel de administración.

Lo reemplazó la [versión 2](https://github.com/Nicolomano/catalogo-ayp-v2), que hoy está en
producción en [refrigeracionayp.com](https://refrigeracionayp.com).

Caso de estudio completo:
[nicolasromano.vercel.app/proyectos/catalogo-basico](https://nicolasromano.vercel.app/proyectos/catalogo-basico)

> **English:** First online catalog for a refrigeration parts store: public catalog, cart
> that sends the order over WhatsApp, USD prices converted at the current exchange rate,
> installation kits and an admin panel with Excel import. Replaced by
> [v2](https://github.com/Nicolomano/catalogo-ayp-v2).
> [Read the case study](https://nicolasromano.vercel.app/en/projects/catalogo-basico).

## Qué hace

- **Catálogo público:** búsqueda de texto completo, filtros por categoría, subcategoría y
  marca, scroll infinito, destacados, novedades, carrusel de banners y feed de Instagram.
- **Precios en dólares** convertidos a pesos con la cotización que carga el admin. También
  admite un precio fijo en pesos y muestra el precio en cuotas.
- **Técnicos matriculados:** se registran, el admin recibe un email, los aprueba y desde ahí
  ven un precio especial.
- **Pedido por WhatsApp:** el carrito arma el mensaje con productos, cantidades, subtotales y
  la cotización aplicada.
- **Kits de instalación** armados desde el admin, con el precio calculado a partir de sus
  componentes.
- **Panel de administración:** productos, categorías, banners, usuarios y kits; métricas de
  vistas; importación y exportación de stock y precios por Excel; textos de la landing
  editables.

## Decisiones técnicas

- **Modelo de datos con la lógica del negocio:** precios en dos monedas, precio según el rol
  del usuario y sincronización con el Excel del sistema contable. Índices compuestos en
  MongoDB para las consultas frecuentes (activos por marca, destacados, novedades) y un
  índice de texto para la búsqueda.
- **Importación de Excel que respeta las ediciones a mano:** actualiza stock y precios pero
  conserva los nombres de producto que el admin corrigió en el panel.
- **Migración de imágenes** de Cloudinary a Cloudflare R2 con un script propio
  (`Backend/src/scripts/migrateToR2.js`) que las redimensiona y comprime con sharp.

## Stack

| Parte | Tecnologías |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS 4, React Router 7 · deploy en Vercel |
| Backend | Node.js, Express 5, MongoDB + Mongoose, JWT, express-validator |
| Archivos y mails | Cloudflare R2 (S3), sharp, Multer, Nodemailer |
| Excel | xlsx |

## Estructura

```
Backend/
  src/config/       configuración y variables de entorno
  src/routes/       rutas de la API
  src/controllers/  lógica de cada endpoint
  src/services/     modelos de Mongoose y acceso a datos
  src/middlewares/  autenticación y validación
  src/scripts/      migración de imágenes a R2
frontend/
  src/pages/        catálogo, detalle, carrito, kits, contacto y panel de administración
  src/components/   componentes compartidos
  src/api/          cliente de la API
  src/Context/      estado global (carrito, sesión)
```

## Cómo correrlo

Requiere Node.js y una base de MongoDB (local o Atlas).

**Backend**

```bash
cd Backend
npm install
cp .env.example src/config/.env.development   # y completar los valores
npm run dev
```

Variables: `MONGO_URI`, `JWT_SECRET`, `SERVER_PORT`, `FRONTEND_URL`, `ADMIN_NAME`,
`ADMIN_PASSWORD`, `STORE_WHATSAPP`, `GMAIL_ACCOUNT`, `GMAIL_PASSWORD` y, para las imágenes,
`R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`.

**Frontend**

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL (opcional: VITE_SITE_URL, la URL pública del sitio)
npm run dev
```

## Autor

Nicolás Romano · [nicolasromano.vercel.app](https://nicolasromano.vercel.app) ·
[LinkedIn](https://www.linkedin.com/in/nicolasromano3515)
