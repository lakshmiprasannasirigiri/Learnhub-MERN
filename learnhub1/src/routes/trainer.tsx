import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, X, Users, BookOpen } from "lucide-react";

export const Route = createFileRoute("/trainer")({
  head: () => ({ meta: [{ title: "Trainer · LearnHub" }] }),
  component: TrainerDashboard,
});

function TrainerDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "trainer")) navigate({ to: "/login" });
  }, [user, loading, navigate]);

  const { data: courses } = useQuery({
    queryKey: ["courses"],
    queryFn: () => api.listCourses(),
    enabled: !!user,
  });

  const myCourses = courses?.filter((c) => c.trainerId === user?._id) ?? [];

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Trainer dashboard</p>
            <h1 className="text-3xl font-bold text-primary md:text-4xl">{user.name}</h1>
          </div>
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> New course
          </Button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Stat label="Courses created" value={myCourses.length} icon={BookOpen} />
          <Stat label="Total students" value={myCourses.reduce((a, c) => a + c.enrolledStudentIds.length, 0)} icon={Users} />
          <Stat label="Total lessons" value={myCourses.reduce((a, c) => a + c.lessons.length, 0)} icon={BookOpen} />
        </div>

        <h2 className="mt-10 text-xl font-bold text-primary">My courses</h2>
        {myCourses.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed bg-card p-10 text-center">
            <p className="text-muted-foreground">No courses yet. Create your first one.</p>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {myCourses.map((c) => (
              <div key={c._id} className="rounded-2xl border bg-card p-6">
                <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">{c.category}</span>
                <h3 className="mt-3 font-semibold text-foreground">{c.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>
                <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{c.lessons.length} lessons</span>
                  <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {c.enrolledStudentIds.length} students</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {open && <NewCourseModal onClose={() => setOpen(false)} onCreated={() => qc.invalidateQueries({ queryKey: ["courses"] })} />}
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

function NewCourseModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [lessons, setLessons] = useState<{ title: string; content: string }[]>([{ title: "", content: "" }]);

  const create = useMutation({
    mutationFn: () => api.createCourse({ title, description, category, lessons: lessons.filter((l) => l.title) }),
    onSuccess: () => {
      toast.success("Course created");
      onCreated();
      onClose();
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-card p-6 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-primary">New course</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-5 space-y-4">
          <div className="space-y-2"><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div className="space-y-2"><Label>Category</Label><Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Web Development" /></div>
          <div className="space-y-2"><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} /></div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Lessons</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => setLessons([...lessons, { title: "", content: "" }])}>
                <Plus className="h-3.5 w-3.5" /> Add lesson
              </Button>
            </div>
            {lessons.map((l, i) => (
              <div key={i} className="space-y-2 rounded-lg border p-3">
                <Input
                  placeholder={`Lesson ${i + 1} title`}
                  value={l.title}
                  onChange={(e) => setLessons(lessons.map((x, j) => (i === j ? { ...x, title: e.target.value } : x)))}
                />
                <Textarea
                  placeholder="Lesson content"
                  rows={2}
                  value={l.content}
                  onChange={(e) => setLessons(lessons.map((x, j) => (i === j ? { ...x, content: e.target.value } : x)))}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={() => create.mutate()} disabled={create.isPending || !title}>
              {create.isPending ? "Creating..." : "Create course"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
