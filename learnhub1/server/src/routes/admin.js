import { Router } from "express";
import User from "../models/User.js";
import { auth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/users", auth, requireRole("admin"), async (_req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (e) { next(e); }
});

export default router;
