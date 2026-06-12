import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { BookOpen, TrendingUp, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · LearnHub" }] }),
  component: StudentDashboard,
});

function StudentDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login", search: { redirect: "/dashboard" } });
  }, [user, loading, navigate]);

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ["myEnrollments"],
    queryFn: () => api.myEnrollments(),
    enabled: !!user,
  });

  if (loading || !user) return null;

  const totalLessons = enrollments?.reduce((acc, e) => acc + e.course.lessons.length, 0) ?? 0;
  const completedLessons = enrollments?.reduce((acc, e) => acc + e.completedLessons.length, 0) ?? 0;
  const avgProgress = enrollments?.length
    ? Math.round(enrollments.reduce((acc, e) => acc + e.progress, 0) / enrollments.length)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Welcome back,</p>
            <h1 className="text-3xl font-bold text-primary md:text-4xl">{user.name}</h1>
          </div>
          <Link to="/courses">
            <Button>Browse courses</Button>
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <StatCard icon={BookOpen} label="Enrolled courses" value={enrollments?.length ?? 0} />
          <StatCard icon={CheckCircle2} label="Lessons completed" value={`${completedLessons}/${totalLessons}`} />
          <StatCard icon={TrendingUp} label="Average progress" value={`${avgProgress}%`} />
        </div>

        <h2 className="mt-10 text-xl font-bold text-primary">My courses</h2>
        {isLoading ? (
          <p className="mt-4 text-muted-foreground">Loading...</p>
        ) : enrollments?.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed bg-card p-10 text-center">
            <p className="text-muted-foreground">You haven't enrolled in any course yet.</p>
            <Link to="/courses">
              <Button className="mt-4">Explore courses</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {enrollments?.map((e) => (
              <Link
                key={e._id}
                to="/courses/$courseId"
                params={{ courseId: e.courseId }}
                className="rounded-2xl border bg-card p-6 transition hover:shadow-soft"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                    {e.course.category}
                  </span>
                  <span className="text-sm font-semibold text-primary">{e.progress}%</span>
                </div>
                <h3 className="mt-3 font-semibold text-foreground">{e.course.title}</h3>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full lh-gradient" style={{ width: `${e.progress}%` }} />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {e.completedLessons.length} / {e.course.lessons.length} lessons completed
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
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
