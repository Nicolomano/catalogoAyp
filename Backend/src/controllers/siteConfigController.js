import SiteConfig from "../services/models/siteConfigModel.js";

const SINGLETON = { singleton_key: "main" };

export const getConfig = async (req, res) => {
  try {
    let config = await SiteConfig.findOne(SINGLETON).lean();
    if (!config) {
      // Primera vez: crear con valores por defecto
      config = await SiteConfig.create(SINGLETON);
    }
    res.json(config);
  } catch (e) {
    res.status(500).json({ message: "Error obteniendo config", error: e.message });
  }
};

export const updateConfig = async (req, res) => {
  try {
    const config = await SiteConfig.findOneAndUpdate(
      SINGLETON,
      { $set: req.body },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(config);
  } catch (e) {
    res.status(500).json({ message: "Error guardando config", error: e.message });
  }
};
