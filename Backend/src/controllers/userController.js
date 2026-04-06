import User from "../services/models/userModel.js";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

const JWT_SECRET = config.jwtSecret;

export async function registerUser(req, res) {
  try {
    const { name, email, password, company, matricula, province, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Nombre, email y contraseña son obligatorios" });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Ya existe una cuenta con ese email" });

    const user = await User.create({
      name,
      email,
      password,
      company,
      matricula,
      province,
      phone,
      role: "service",
      status: "pending",
    });
    res.status(201).json({
      message: "Registro exitoso. Tu cuenta está pendiente de aprobación.",
      userId: user._id,
    });
  } catch (error) {
    res.status(500).json({ message: "Error en el registro", error: error.message });
  }
}

export async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, role: "service" });
    if (!user) return res.status(401).json({ message: "Credenciales inválidas" });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ message: "Credenciales inválidas" });

    if (user.status === "pending") {
      return res.status(403).json({
        message: "Tu cuenta está pendiente de aprobación.",
        status: "pending",
      });
    }
    if (user.status === "rejected") {
      return res.status(403).json({
        message: "Tu cuenta fue rechazada.",
        status: "rejected",
        reason: user.rejectionReason,
      });
    }

    const token = jwt.sign({ id: user._id, role: "service" }, JWT_SECRET, { expiresIn: "7d" });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        company: user.company,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error en el login", error: error.message });
  }
}

export async function getMe(req, res) {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error", error: error.message });
  }
}

// Admin functions
export async function listUsers(req, res) {
  try {
    const { status } = req.query;
    const filter = { role: "service" };
    if (status) filter.status = status;
    const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error listando usuarios", error: error.message });
  }
}

export async function updateUserStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Estado inválido" });
    }
    const user = await User.findByIdAndUpdate(
      id,
      { status, rejectionReason, approved: status === "approved" },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error actualizando estado", error: error.message });
  }
}

export async function getPendingCount(req, res) {
  try {
    const count = await User.countDocuments({ role: "service", status: "pending" });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Error", error: error.message });
  }
}
