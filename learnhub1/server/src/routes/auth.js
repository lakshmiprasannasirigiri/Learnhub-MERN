import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { auth } from "../middleware/auth.js";

const router = Router();

function sign(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return next({ status: 400, message: "Missing fields" });
    if (password.length < 6) return next({ status: 400, message: "Password too short" });
    const exists = await User.findOne({ email });
    if (exists) return next({ status: 409, message: "Email already registered" });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hash,
      role: ["admin", "trainer", "student"].includes(role) ? role : "student",
    });
    res.json({ token: sign(user), user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    next(e);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next({ status: 401, message: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return next({ status: 401, message: "Invalid credentials" });
    res.json({ token: sign(user), user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    next(e);
  }
});

router.get("/me", auth, (req, res) => res.json(req.user));

export default router;
