import configModel from "../services/models/configModel.js";
import productModel from "../services/models/productModel.js";

export async function updateExchangeRate(req, res) {
  const { exchangeRate } = req.body;
  if (exchangeRate == null) {
    return res.status(400).json({ message: "Exchange rate is required" });
  }

  try {
    const cfg = await configModel.findOneAndUpdate(
      {},
      { exchangeRate: Number(exchangeRate) },
      { new: true, upsert: true }
    );

    // Recalcular SOLO los que NO son fijos en ARS
    await productModel.updateMany(
      {}, // usamos $set con $cond, así no necesitamos filtrar aquí
      [
        {
          $set: {
            priceARS: {
              $cond: [
                { $eq: ["$fixedInARS", true] }, // si es fijo → mantener
                "$priceARS",
                {
                  $multiply: [
                    { $ifNull: ["$priceUSD", 0] },
                    Number(exchangeRate),
                  ],
                },
              ],
            },
          },
        },
      ]
    );

    res.json({ ok: true, exchangeRate: cfg.exchangeRate });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating exchange rate", error: err.message });
  }
}

export async function getExchangeRate(req, res) {
  try {
    const config = await configModel.findOne();
    if (!config) {
      return res.status(404).json({ message: "Configuration not found" });
    }
    res.status(200).json({ exchangeRate: config.exchangeRate });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching exchange rate", error: error.message });
  }
}

export const getInstallKit = async (req, res) => {
  const cfg = await configModel.findOne({}, { installKit: 1 });
  res.json(cfg?.installKit || { items: [] });
};

export const updateInstallKit = async (req, res) => {
  try {
    const { installKit } = req.body;
    const cfg = await configModel.findOneAndUpdate(
      {},
      { installKit },
      { new: true, upsert: true }
    );
    res.json(cfg.installKit);
  } catch (err) {
    res.status(500).json({
      message: "Error actualizando configuración",
      error: err.message,
    });
  }
};
