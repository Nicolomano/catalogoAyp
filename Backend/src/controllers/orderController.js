import Order from "../services/models/orderModel.js";
import Config from "../services/models/configModel.js";
import Product from "../services/models/productModel.js";

// Si tenés un config central, podés leerlo de ahí.
import config from "../config/config.js";

// Número de WhatsApp del LOCAL (formato WhatsApp: 549 + area + número)
const STORE_WHATSAPP = config.storeWhatsApp;

// helper para formatear texto del detalle
const formatMoney = (n) => {
  if (typeof n !== "number") return n;
  return n.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const createOrder = async (req, res) => {
  try {
    const { products, customerName, customerPhone } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res
        .status(400)
        .json({ message: "La orden debe incluir productos." });
    }
    if (!customerName || !customerPhone) {
      return res
        .status(400)
        .json({ message: "Faltan datos del cliente (nombre y teléfono)." });
    }

    // Tomamos la cotización vigente para garantizar totales correctos (no confiamos en el frontend)
    const cfg = await Config.findOne();
    const exchangeRate = cfg?.exchangeRate || 1;

    let totalUSD = 0;
    let totalARS = 0;
    const orderProducts = [];

    // Releemos cada producto desde DB para evitar manipulación del precio
    for (const item of products) {
      const prod = await Product.findById(item.productId);
      if (!prod) continue;

      const qty = Number(item.quantity || 0);
      if (qty <= 0) continue;

      const subUSD = prod.priceUSD * qty;
      const subARS = prod.priceARS * qty; // ya persistido con tu lógica de exchangeRate

      totalUSD += subUSD;
      totalARS += subARS;

      orderProducts.push({
        productId: prod._id,
        name: prod.name,
        quantity: qty,
        priceUSD: prod.priceUSD,
        priceARS: prod.priceARS,
      });
    }

    if (orderProducts.length === 0) {
      return res.status(400).json({
        message:
          "No se pudo construir la orden. Verificá los IDs y cantidades.",
      });
    }

    const newOrder = new Order({
      products: orderProducts,
      totalUSD,
      totalARS,
      customerName,
      customerPhone,
    });
    await newOrder.save();

    // Texto de WhatsApp: va dirigido AL LOCAL
    const lines = orderProducts
      .map(
        (p) =>
          `• ${p.quantity}× ${p.name} — ${formatMoney(
            p.priceUSD * p.quantity
          )} USD (${formatMoney(p.priceARS * p.quantity)} ARS)`
      )
      .join("\n");

    const text = encodeURIComponent(
      `🛒 Nueva orden\n\n` +
        `${lines}\n\n` +
        `Total:  ${formatMoney(totalARS)} ARS\n` +
        `Cotización aplicada: ${formatMoney(exchangeRate)} ARS/USD\n\n` +
        `👤 Cliente: ${customerName}\n` +
        `📞 Tel: ${customerPhone}`
    );

    // IMPORTANTE: el número es el del LOCAL (para que el cliente inicie el chat hacia el negocio)
    const waPhone = String(STORE_WHATSAPP).replace(/[^\d]/g, "");
    const waLink = `https://wa.me/${waPhone}?text=${text}`;
    // Alternativa compatible:
    // const waLink = `https://api.whatsapp.com/send?phone=${waPhone}&text=${text}`;

    res.status(201).json({ order: newOrder, waLink });
  } catch (error) {
    console.error("❌ Error creando orden:", error);
    res
      .status(400)
      .json({ message: "Error creando orden", error: error?.message || error });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: "Error obteniendo órdenes",
      error: error?.message || error,
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Orden no encontrada" });
    res.json(order);
  } catch (error) {
    res.status(500).json({
      message: "Error obteniendo orden",
      error: error?.message || error,
    });
  }
};
