import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { Users, BookOpen, GraduationCap, Shield } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin · LearnHub" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: () => api.listUsers(),
    enabled: !!user && user.role === "admin",
  });

  const { data: courses } = useQuery({
    queryKey: ["courses"],
    queryFn: () => api.listCourses(),
    enabled: !!user,
  });

  if (loading || !user) return null;

  const students = users?.filter((u) => u.role === "student").length ?? 0;
  const trainers = users?.filter((u) => u.role === "trainer").length ?? 0;
  const admins = users?.filter((u) => u.role === "admin").length ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-sm text-muted-foreground">Admin dashboard</p>
        <h1 className="text-3xl font-bold text-primary md:text-4xl">System overview</h1>

        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <Stat label="Students" value={students} icon={GraduationCap} />
          <Stat label="Trainers" value={trainers} icon={Users} />
          <Stat label="Admins" value={admins} icon={Shield} />
          <Stat label="Courses" value={courses?.length ?? 0} icon={BookOpen} />
        </div>

        <h2 className="mt-10 text-xl font-bold text-primary">All users</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-accent/50 text-xs uppercase tracking-wider text-primary">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((u) => (
                <tr key={u._id} className="border-t">
                  <td className="px-4 py-3 font-medium text-foreground">{u.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold capitalize text-accent-foreground">
                      {u.role}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-10 text-xl font-bold text-primary">All courses</h2>
        <div className="mt-4 overflow-hidden rounded-2xl border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-accent/50 text-xs uppercase tracking-wider text-primary">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Trainer</th>
                <th className="px-4 py-3">Lessons</th>
                <th className="px-4 py-3">Enrolled</th>
              </tr>
            </thead>
            <tbody>
              {courses?.map((c) => (
                <tr key={c._id} className="border-t">
                  <td className="px-4 py-3 font-medium text-foreground">{c.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.category}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.trainerName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.lessons.length}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.enrolledStudentIds.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: any }) {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-primary">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 text-3xl font-bold text-primary">{value}</p>
    </div>
  );
}
