import userModel from "../services/models/userModel.js";
import jwt from "jsonwebtoken";
import config from "../config/config.js";

const JWT_SECRET = config.jwtSecret;

// export const registerAdmin = async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     const userExists = await userModel.findOne({ username });
//     if (userExists)
//       return res.status(400).json({ message: "Usuario ya existe" });

//     const user = new userModel({ username, password });
//     await user.save();

//     res.status(201).json({ message: "Admin creado correctamente" });
//   } catch (error) {
//     res.status(500).json({ message: "Error creando admin", error });
//   }
// };

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await userModel.findOne({ username });
    if (!user)
      return res.status(401).json({ message: "Credenciales inválidas" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Credenciales inválidas" });

    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Error en login", error });
  }
};
