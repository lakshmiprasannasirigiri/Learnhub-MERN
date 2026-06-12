import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";
import { BookOpen, Users } from "lucide-react";

export const Route = createFileRoute("/courses/")({
  head: () => ({ meta: [{ title: "Courses · LearnHub" }] }),
  component: CoursesPage,
});

function CoursesPage() {
  const { data: courses, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: () => api.listCourses(),
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary md:text-4xl">All courses</h1>
            <p className="mt-2 text-muted-foreground">Find a course and start learning today.</p>
          </div>
        </div>

        {isLoading && <p className="mt-10 text-muted-foreground">Loading...</p>}

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {courses?.map((c) => (
            <Link
              key={c._id}
              to="/courses/$courseId"
              params={{ courseId: c._id }}
              className="group rounded-2xl border bg-card p-6 transition hover:-translate-y-0.5 hover:shadow-soft"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                  {c.category}
                </span>
                <BookOpen className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground group-hover:text-primary">{c.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
              <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
                <span>By {c.trainerName}</span>
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> {c.enrolledStudentIds.length} enrolled
                </span>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">{c.lessons.length} lessons</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
