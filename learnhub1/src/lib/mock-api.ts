// LocalStorage-backed mock backend used when VITE_API_URL is not set.
// Lets the preview work end-to-end without the Express/Mongo backend.
import type { Course, Enrollment, Role, User } from "./api";

const K = {
  users: "lh_mock_users",
  courses: "lh_mock_courses",
  enrollments: "lh_mock_enrollments",
  session: "lh_mock_session",
};

function ls<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const v = localStorage.getItem(key);
  return v ? (JSON.parse(v) as T) : fallback;
}
function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}
function uid() {
  return Math.random().toString(36).slice(2, 10);
}
function delay<T>(v: T, ms = 200): Promise<T> {
  return new Promise((r) => setTimeout(() => r(v), ms));
}

function seed() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem("lh_mock_seeded")) return;

  const users: (User & { password: string })[] = [
    { _id: "u_admin", name: "Admin User", email: "admin@learnhub.io", role: "admin", password: "admin123" },
    { _id: "u_trainer", name: "Priya Trainer", email: "trainer@learnhub.io", role: "trainer", password: "trainer123" },
    { _id: "u_student", name: "Arjun Student", email: "student@learnhub.io", role: "student", password: "student123" },
  ];

  const courses: Course[] = [
    {
      _id: "c1",
      title: "Full-Stack Web Development",
      description: "Master React, Node.js, Express, and MongoDB to build modern web apps.",
      category: "Web Development",
      trainerId: "u_trainer",
      trainerName: "Priya Trainer",
      lessons: [
        { title: "Intro to MERN", content: "Overview of the MERN stack and project setup." },
        { title: "React Fundamentals", content: "Components, props, state, hooks." },
        { title: "Building REST APIs with Express", content: "Routing, middleware, controllers." },
        { title: "MongoDB & Mongoose", content: "Schemas, models, queries." },
        { title: "Authentication with JWT", content: "Login, register, protected routes." },
      ],
      enrolledStudentIds: [],
      createdAt: new Date().toISOString(),
    },
    {
      _id: "c2",
      title: "Data Structures & Algorithms",
      description: "Crack coding interviews with structured DSA practice.",
      category: "Computer Science",
      trainerId: "u_trainer",
      trainerName: "Priya Trainer",
      lessons: [
        { title: "Arrays & Strings", content: "Two pointers, sliding window." },
        { title: "Linked Lists", content: "Singly, doubly, reverse, detect cycle." },
        { title: "Trees & Graphs", content: "BFS, DFS, traversal." },
        { title: "Dynamic Programming", content: "Memoization, tabulation patterns." },
      ],
      enrolledStudentIds: [],
      createdAt: new Date().toISOString(),
    },
    {
      _id: "c3",
      title: "Aptitude & Interview Prep",
      description: "Quantitative aptitude, logical reasoning, and HR interview preparation.",
      category: "Placement Prep",
      trainerId: "u_trainer",
      trainerName: "Priya Trainer",
      lessons: [
        { title: "Quantitative Aptitude", content: "Percentages, ratios, time & work." },
        { title: "Logical Reasoning", content: "Series, puzzles, syllogisms." },
        { title: "HR Interview", content: "Tell me about yourself, strengths/weaknesses." },
      ],
      enrolledStudentIds: [],
      createdAt: new Date().toISOString(),
    },
  ];

  save(K.users, users);
  save(K.courses, courses);
  save(K.enrollments, [] as Enrollment[]);
  localStorage.setItem("lh_mock_seeded", "1");
}

function currentUser(): User | null {
  seed();
  const s = ls<{ userId: string } | null>(K.session, null);
  if (!s) return null;
  const users = ls<(User & { password: string })[]>(K.users, []);
  const u = users.find((x) => x._id === s.userId);
  if (!u) return null;
  const { password, ...rest } = u;
  return rest;
}

function requireUser(): User {
  const u = currentUser();
  if (!u) throw new Error("Not authenticated");
  return u;
}

export const mockApi = {
  async register(data: { name: string; email: string; password: string; role: Role }) {
    seed();
    const users = ls<(User & { password: string })[]>(K.users, []);
    if (users.some((u) => u.email === data.email)) throw new Error("Email already registered");
    const user: User & { password: string } = { _id: `u_${uid()}`, ...data };
    users.push(user);
    save(K.users, users);
    save(K.session, { userId: user._id });
    localStorage.setItem("lh_token", `mock.${user._id}`);
    const { password, ...rest } = user;
    return delay({ token: `mock.${user._id}`, user: rest });
  },
  async login(data: { email: string; password: string }) {
    seed();
    const users = ls<(User & { password: string })[]>(K.users, []);
    const u = users.find((x) => x.email === data.email && x.password === data.password);
    if (!u) throw new Error("Invalid email or password");
    save(K.session, { userId: u._id });
    localStorage.setItem("lh_token", `mock.${u._id}`);
    const { password, ...rest } = u;
    return delay({ token: `mock.${u._id}`, user: rest });
  },
  async me() {
    const u = currentUser();
    if (!u) throw new Error("Not authenticated");
    return delay(u);
  },
  async listCourses() {
    seed();
    return delay(ls<Course[]>(K.courses, []));
  },
  async getCourse(id: string) {
    seed();
    const c = ls<Course[]>(K.courses, []).find((x) => x._id === id);
    if (!c) throw new Error("Course not found");
    return delay(c);
  },
  async createCourse(data: Partial<Course>) {
    const user = requireUser();
    if (user.role !== "trainer" && user.role !== "admin") throw new Error("Forbidden");
    const courses = ls<Course[]>(K.courses, []);
    const course: Course = {
      _id: `c_${uid()}`,
      title: data.title || "Untitled",
      description: data.description || "",
      category: data.category || "General",
      trainerId: user._id,
      trainerName: user.name,
      lessons: data.lessons || [],
      enrolledStudentIds: [],
      createdAt: new Date().toISOString(),
    };
    courses.push(course);
    save(K.courses, courses);
    return delay(course);
  },
  async enroll(courseId: string) {
    const user = requireUser();
    if (user.role !== "student") throw new Error("Only students can enroll");
    const enrollments = ls<Enrollment[]>(K.enrollments, []);
    const existing = enrollments.find((e) => e.courseId === courseId && e.studentId === user._id);
    if (existing) return delay(existing);
    const enrollment: Enrollment = {
      _id: `e_${uid()}`,
      courseId,
      studentId: user._id,
      progress: 0,
      completedLessons: [],
    };
    enrollments.push(enrollment);
    save(K.enrollments, enrollments);
    const courses = ls<Course[]>(K.courses, []);
    const c = courses.find((x) => x._id === courseId);
    if (c && !c.enrolledStudentIds.includes(user._id)) {
      c.enrolledStudentIds.push(user._id);
      save(K.courses, courses);
    }
    return delay(enrollment);
  },
  async myEnrollments() {
    const user = requireUser();
    const enrollments = ls<Enrollment[]>(K.enrollments, []).filter((e) => e.studentId === user._id);
    const courses = ls<Course[]>(K.courses, []);
    return delay(
      enrollments.map((e) => ({ ...e, course: courses.find((c) => c._id === e.courseId)! })).filter((x) => x.course),
    );
  },
  async markLesson(courseId: string, lessonIndex: number) {
    const user = requireUser();
    const enrollments = ls<Enrollment[]>(K.enrollments, []);
    const e = enrollments.find((x) => x.courseId === courseId && x.studentId === user._id);
    if (!e) throw new Error("Not enrolled");
    if (!e.completedLessons.includes(lessonIndex)) e.completedLessons.push(lessonIndex);
    const course = ls<Course[]>(K.courses, []).find((c) => c._id === courseId)!;
    e.progress = Math.round((e.completedLessons.length / Math.max(1, course.lessons.length)) * 100);
    save(K.enrollments, enrollments);
    return delay(e);
  },
  async listUsers() {
    const user = requireUser();
    if (user.role !== "admin") throw new Error("Forbidden");
    const users = ls<(User & { password: string })[]>(K.users, []);
    return delay(users.map(({ password, ...u }) => u));
  },
};
