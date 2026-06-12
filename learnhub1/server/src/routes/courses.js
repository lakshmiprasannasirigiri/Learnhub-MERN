import { Router } from "express";
import Course from "../models/Course.js";
import { auth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json(courses);
  } catch (e) { next(e); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return next({ status: 404, message: "Course not found" });
    res.json(course);
  } catch (e) { next(e); }
});

router.post("/", auth, requireRole("trainer", "admin"), async (req, res, next) => {
  try {
    const { title, description, category, lessons } = req.body;
    const course = await Course.create({
      title, description, category, lessons: lessons || [],
      trainerId: req.user._id,
      trainerName: req.user.name,
    });
    res.json(course);
  } catch (e) { next(e); }
});

export default router;
