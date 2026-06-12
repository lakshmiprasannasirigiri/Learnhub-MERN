// Mock-aware API client. Uses fetch against VITE_API_URL when defined,
// otherwise falls back to localStorage-backed mock so the preview works.
import { mockApi } from "./mock-api";

const BASE = (import.meta as any).env?.VITE_API_URL as string | undefined;

export type Role = "admin" | "trainer" | "student";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  category: string;
  trainerId: string;
  trainerName: string;
  lessons: { title: string; content: string }[];
  enrolledStudentIds: string[];
  createdAt: string;
}

export interface Enrollment {
  _id: string;
  courseId: string;
  studentId: string;
  progress: number; // 0-100
  completedLessons: number[];
}

function token() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("lh_token");
}

async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || `Request failed: ${res.status}`);
  }
  return res.json();
}

const useMock = !BASE;

export const api = {
  // auth
  register: (data: { name: string; email: string; password: string; role: Role }) =>
    useMock ? mockApi.register(data) : http<{ token: string; user: User }>("/api/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    useMock ? mockApi.login(data) : http<{ token: string; user: User }>("/api/auth/login", { method: "POST", body: JSON.stringify(data) }),
  me: () =>
    useMock ? mockApi.me() : http<User>("/api/auth/me"),

  // courses
  listCourses: () =>
    useMock ? mockApi.listCourses() : http<Course[]>("/api/courses"),
  getCourse: (id: string) =>
    useMock ? mockApi.getCourse(id) : http<Course>(`/api/courses/${id}`),
  createCourse: (data: Partial<Course>) =>
    useMock ? mockApi.createCourse(data) : http<Course>("/api/courses", { method: "POST", body: JSON.stringify(data) }),
  enroll: (courseId: string) =>
    useMock ? mockApi.enroll(courseId) : http<Enrollment>(`/api/courses/${courseId}/enroll`, { method: "POST" }),
  myEnrollments: () =>
    useMock ? mockApi.myEnrollments() : http<(Enrollment & { course: Course })[]>("/api/enrollments/me"),
  markLesson: (courseId: string, lessonIndex: number) =>
    useMock ? mockApi.markLesson(courseId, lessonIndex) : http<Enrollment>(`/api/enrollments/${courseId}/lesson/${lessonIndex}`, { method: "POST" }),

  // admin
  listUsers: () =>
    useMock ? mockApi.listUsers() : http<User[]>("/api/admin/users"),
};
