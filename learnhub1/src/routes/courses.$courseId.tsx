import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Users } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/courses/$courseId")({
  head: () => ({ meta: [{ title: "Course · LearnHub" }] }),
  component: CourseDetail,
});

function CourseDetail() {
  const { courseId } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => api.getCourse(courseId),
  });

  const { data: enrollments } = useQuery({
    queryKey: ["myEnrollments"],
    queryFn: () => api.myEnrollments(),
    enabled: !!user && user.role === "student",
  });

  const enrollment = enrollments?.find((e) => e.courseId === courseId);

  const enroll = useMutation({
    mutationFn: () => api.enroll(courseId),
    onSuccess: () => {
      toast.success("Enrolled successfully");
      qc.invalidateQueries({ queryKey: ["myEnrollments"] });
      qc.invalidateQueries({ queryKey: ["course", courseId] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const markLesson = useMutation({
    mutationFn: (idx: number) => api.markLesson(courseId, idx),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myEnrollments"] });
    },
  });

  if (isLoading || !course) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <p className="mx-auto max-w-6xl px-4 py-12 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-3xl lh-gradient p-8 text-primary-foreground shadow-soft">
          <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            {course.category}
          </span>
          <h1 className="mt-3 text-3xl font-bold md:text-4xl">{course.title}</h1>
          <p className="mt-3 max-w-2xl text-sm opacity-90 md:text-base">{course.description}</p>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm opacity-90">
            <span>Trainer: {course.trainerName}</span>
            <span className="inline-flex items-center gap-1"><Users className="h-4 w-4" /> {course.enrolledStudentIds.length} enrolled</span>
            <span>{course.lessons.length} lessons</span>
          </div>

          <div className="mt-6">
            {!user ? (
              <Button variant="secondary" onClick={() => navigate({ to: "/login" })}>
                Sign in to enroll
              </Button>
            ) : user.role === "student" && !enrollment ? (
              <Button variant="secondary" onClick={() => enroll.mutate()} disabled={enroll.isPending}>
                {enroll.isPending ? "Enrolling..." : "Enroll now"}
              </Button>
            ) : enrollment ? (
              <div className="flex items-center gap-3">
                <div className="h-2 w-48 overflow-hidden rounded-full bg-white/25">
                  <div className="h-full bg-white" style={{ width: `${enrollment.progress}%` }} />
                </div>
                <span className="text-sm font-semibold">{enrollment.progress}% complete</span>
              </div>
            ) : (
              <p className="text-sm opacity-90">Only students can enroll. You're signed in as {user.role}.</p>
            )}
          </div>
        </div>

        <h2 className="mt-10 text-xl font-bold text-primary">Lessons</h2>
        <ol className="mt-4 space-y-3">
          {course.lessons.map((lesson, idx) => {
            const done = enrollment?.completedLessons.includes(idx);
            return (
              <li key={idx} className="rounded-2xl border bg-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5">
                      {done ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </span>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {idx + 1}. {lesson.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">{lesson.content}</p>
                    </div>
                  </div>
                  {enrollment && !done && (
                    <Button size="sm" variant="outline" onClick={() => markLesson.mutate(idx)}>
                      Mark complete
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
