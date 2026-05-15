import jwt, { decode } from "jsonwebtoken";
import dotenv from "dotenv";
import Users from "../module/user.model.js";
dotenv.config();
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Token Not Provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token Missing" });
    }

    const decoded = jwt.verify(token, process.env.SECRET_STRING);

    const user = await Users.findByPk(decoded.id);
    if (!user || user.status === "Inactive") {
      return res.status(401).json({ message: "Invalid Token" });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorize User" });
  }
};
