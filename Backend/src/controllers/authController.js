import userModel from "../services/models/userModel.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import config from "../config/config.js";

const JWT_SECRET = config.jwtSecret;

/* ---------- mailer helper ---------- */
function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.emailAccount,
      pass: config.emailPassword,
    },
  });
}

/* ---------- ADMIN REGISTER ---------- */
export const registerAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const userExists = await userModel.findOne({ username });
    if (userExists)
      return res.status(400).json({ message: "Usuario ya existe" });

    const user = new userModel({ username, password, role: "admin" });
    await user.save();

    res.status(201).json({ message: "Admin creado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error creando admin", error });
  }
};

/* ---------- SERVICE USER REGISTER ---------- */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, company, matricula, province, phone } =
      req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Nombre, email y contraseña son obligatorios" });
    }

    const existing = await userModel.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "El email ya está registrado" });

    const user = new userModel({
      name,
      email,
      password,
      company: company || "",
      matricula: matricula || "",
      province: province || "",
      phone: phone || "",
      role: "service",
      approved: false,
    });

    await user.save();

    /* Send notification email to admin */
    try {
      const transporter = createTransporter();
      await transporter.sendMail({
        from: `"Catálogo A&P" <${config.emailAccount}>`,
        to: config.emailAccount,
        subject: `Nuevo registro de service - ${name}`,
        html: `
          <h2>Nuevo usuario service registrado</h2>
          <table style="font-family:sans-serif;border-collapse:collapse;">
            <tr><td style="padding:4px 12px;font-weight:bold;">Nombre:</td><td style="padding:4px 12px;">${name}</td></tr>
            <tr><td style="padding:4px 12px;font-weight:bold;">Email:</td><td style="padding:4px 12px;">${email}</td></tr>
            <tr><td style="padding:4px 12px;font-weight:bold;">Empresa:</td><td style="padding:4px 12px;">${company || "-"}</td></tr>
            <tr><td style="padding:4px 12px;font-weight:bold;">Matrícula:</td><td style="padding:4px 12px;">${matricula || "-"}</td></tr>
            <tr><td style="padding:4px 12px;font-weight:bold;">Provincia:</td><td style="padding:4px 12px;">${province || "-"}</td></tr>
            <tr><td style="padding:4px 12px;font-weight:bold;">Teléfono:</td><td style="padding:4px 12px;">${phone || "-"}</td></tr>
          </table>
          <p style="margin-top:16px;">Ingresá al panel de admin para aprobar o rechazar el registro.</p>
        `,
      });
    } catch (mailErr) {
      console.error("Error enviando email de notificación:", mailErr.message);
      // Don't fail the registration if email fails
    }

    res.status(201).json({
      message:
        "Registro exitoso. Tu cuenta será revisada por el administrador antes de que puedas acceder.",
    });
  } catch (error) {
    console.error("Error registrando usuario service:", error);
    res.status(500).json({ message: "Error en el registro", error: error.message });
  }
};

/* ---------- LOGIN (admin + service) ---------- */
export const login = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Support login by username (admin) or email (service)
    const query = username ? { username } : { email };
    const user = await userModel.findOne(query);

    if (!user)
      return res.status(401).json({ message: "Credenciales inválidas" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Credenciales inválidas" });

    // Service users must be approved
    if (user.role === "service" && !user.approved) {
      return res.status(403).json({
        message:
          "Tu cuenta aún no fue aprobada. Por favor esperá la confirmación del administrador.",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username || user.email,
        role: user.role,
        approved: user.approved,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      role: user.role,
      approved: user.approved,
      name: user.name || user.username,
    });
  } catch (error) {
    res.status(500).json({ message: "Error en login", error });
  }
};

/* ---------- GET ALL SERVICE USERS (admin only) ---------- */
export const getServiceUsers = async (req, res) => {
  try {
    const users = await userModel
      .find({ role: "service" })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo usuarios", error });
  }
};

/* ---------- APPROVE / REJECT SERVICE USER (admin only) ---------- */
export const updateServiceUserApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { approved } = req.body;

    const user = await userModel.findByIdAndUpdate(
      id,
      { approved: Boolean(approved) },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json({ message: `Usuario ${approved ? "aprobado" : "rechazado"}`, user });
  } catch (error) {
    res.status(500).json({ message: "Error actualizando usuario", error });
  }
};
