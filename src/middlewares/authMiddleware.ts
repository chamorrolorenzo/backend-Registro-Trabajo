import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";

const authMiddleware = async (req: Request, res: Response, next: NextFunction) =>{
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token requerido" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload & { id: string };

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Usuario inválido" });
    }

    // Identidad normalizada
    req.user = {
  id: user._id.toString(),
  role: user.role,
  companyId: user.companyId!.toString(),
};


    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido" });
  }
};

export default authMiddleware;
