import { Router } from "express";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import { auth, requireRole } from "../middleware/auth.js";

const router = Router();

// POST /api/courses/:id/enroll  (mounted under /api/courses via index for cleanliness — but kept here under /api/enrollments)
// Instead we expose: POST /api/enrollments/:courseId
router.post("/:courseId", auth, requireRole("student"), async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return next({ status: 404, message: "Course not found" });
    let enrollment = await Enrollment.findOne({ courseId, studentId: req.user._id });
    if (!enrollment) {
      enrollment = await Enrollment.create({ courseId, studentId: req.user._id });
      if (!course.enrolledStudentIds.some((id) => id.equals(req.user._id))) {
        course.enrolledStudentIds.push(req.user._id);
        await course.save();
      }
    }
    res.json(enrollment);
  } catch (e) { next(e); }
});

router.get("/me", auth, async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ studentId: req.user._id }).lean();
    const ids = enrollments.map((e) => e.courseId);
    const courses = await Course.find({ _id: { $in: ids } }).lean();
    const byId = Object.fromEntries(courses.map((c) => [String(c._id), c]));
    res.json(enrollments.map((e) => ({ ...e, course: byId[String(e.courseId)] })));
  } catch (e) { next(e); }
});

router.post("/:courseId/lesson/:idx", auth, requireRole("student"), async (req, res, next) => {
  try {
    const { courseId, idx } = req.params;
    const lessonIndex = Number(idx);
    const enrollment = await Enrollment.findOne({ courseId, studentId: req.user._id });
    if (!enrollment) return next({ status: 404, message: "Not enrolled" });
    if (!enrollment.completedLessons.includes(lessonIndex)) enrollment.completedLessons.push(lessonIndex);
    const course = await Course.findById(courseId);
    enrollment.progress = Math.round(
      (enrollment.completedLessons.length / Math.max(1, course.lessons.length)) * 100
    );
    await enrollment.save();
    res.json(enrollment);
  } catch (e) { next(e); }
});

export default router;
