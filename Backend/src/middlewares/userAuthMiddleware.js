import jwt from "jsonwebtoken";
import config from "../config/config.js";

export function protectUser(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ message: "No autorizado" });

  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
}
