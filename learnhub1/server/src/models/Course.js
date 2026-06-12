import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema(
  { title: { type: String, required: true }, content: { type: String, default: "" } },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: { type: String, default: "General" },
    trainerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    trainerName: { type: String, required: true },
    lessons: { type: [lessonSchema], default: [] },
    enrolledStudentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);
