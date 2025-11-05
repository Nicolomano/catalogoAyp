import jwt from "jsonwebtoken";
import config from "../config/config.js";
const JWT_SECRET = config.jwtSecret;

export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // ✅ Verificar que haya token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No autorizado, falta token" });
    }

    const token = authHeader.split(" ")[1];

    // ✅ Verificar validez del token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    console.error("❌ Error en autenticación:", error.message);

    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({
          message: "Sesión expirada, por favor inicia sesión nuevamente",
        });
    }

    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};
