import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function auth(req, _res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return next({ status: 401, message: "No token" });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("-password");
    if (!user) return next({ status: 401, message: "Invalid token" });
    req.user = user;
    next();
  } catch (e) {
    next({ status: 401, message: "Invalid token" });
  }
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) return next({ status: 403, message: "Forbidden" });
    next();
  };
}
