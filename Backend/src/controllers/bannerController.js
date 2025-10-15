import Banner from "../services/models/bannerModel.js";

export const listPublicBanners = async (req, res) => {
  try {
    const { type = "home" } = req.query;
    const items = await Banner.find({ active: true, type })
      .sort({ order: 1, createdAt: -1 })
      .lean();
    res.json(items);
  } catch (e) {
    res
      .status(500)
      .json({ message: "Error listando banners", error: e.message });
  }
};

export const listAdminBanners = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = {};
    if (type) filter.type = type;
    const items = await Banner.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .lean();
    res.json(items);
  } catch (e) {
    res.status(500).json({ message: "Error admin banners", error: e.message });
  }
};

export const createBanner = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      linkUrl,
      type = "home",
      order = 0,
      active = true,
    } = req.body;
    // multer-storage-cloudinary deja la URL en file.path
    const image = req.file?.path || req.body.image;
    if (!image) return res.status(400).json({ message: "Imagen requerida" });

    const banner = await Banner.create({
      title,
      subtitle,
      linkUrl,
      type,
      order,
      active,
      image,
    });
    res.status(201).json(banner);
  } catch (e) {
    res.status(500).json({ message: "Error creando banner", error: e.message });
  }
};

export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const data = { ...req.body };
    if (req.file?.path) data.image = req.file.path;
    const updated = await Banner.findByIdAndUpdate(id, data, { new: true });
    res.json(updated);
  } catch (e) {
    res
      .status(500)
      .json({ message: "Error actualizando banner", error: e.message });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    await Banner.findByIdAndDelete(id);
    res.json({ ok: true });
  } catch (e) {
    res
      .status(500)
      .json({ message: "Error eliminando banner", error: e.message });
  }
};

export const toggleBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findById(id);
    banner.active = !banner.active;
    await banner.save();
    res.json({ message: "Estado actualizado", banner });
  } catch (e) {
    res
      .status(500)
      .json({ message: "Error cambiando estado", error: e.message });
  }
};

export const reorderBanners = async (req, res) => {
  try {
    const { ids = [] } = req.body; // [id1,id2,...]
    await Promise.all(
      ids.map((id, idx) => Banner.findByIdAndUpdate(id, { order: idx }))
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: "Error reordenando", error: e.message });
  }
};
