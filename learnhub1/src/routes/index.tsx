import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Briefcase, ClipboardCheck, LineChart, ShieldCheck, Users } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LearnHub — Learn. Track. Get placed." },
      { name: "description", content: "Smart Student Learning & Placement Management for training institutes." },
      { property: "og:title", content: "LearnHub" },
      { property: "og:description", content: "Smart Student Learning & Placement Management for training institutes." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 lh-soft" />
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <h1 className="mt-5 text-4xl font-extrabold leading-tight text-primary md:text-6xl">
                Learn smarter.<br />Get placed faster.
              </h1>
              <p className="mt-5 max-w-md text-base text-muted-foreground md:text-lg">
                LearnHub brings courses, progress tracking, assignments and placements
                together in one platform for students, trainers and admins.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/register">
                  <Button size="lg" className="gap-2">
                    Get started <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button size="lg" variant="outline">Browse courses</Button>
                </Link>
              </div>
              <p className="mt-6 text-xs text-muted-foreground">
                Demo logins: <code className="rounded bg-accent px-1.5 py-0.5">student@learnhub.io / student123</code>
              </p>
            </div>

            <div className="relative">
              <div className="rounded-3xl border bg-card p-6 shadow-soft">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Your progress</p>
                    <p className="mt-1 text-2xl font-bold text-primary">Full-Stack Web Dev</p>
                  </div>
                  <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">60%</span>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full lh-gradient" style={{ width: "60%" }} />
                </div>
                <ul className="mt-6 space-y-3 text-sm">
                  {[
                    { t: "Intro to MERN", d: true },
                    { t: "React Fundamentals", d: true },
                    { t: "Express REST APIs", d: true },
                    { t: "MongoDB & Mongoose", d: false },
                    { t: "JWT Authentication", d: false },
                  ].map((l) => (
                    <li key={l.t} className="flex items-center gap-3">
                      <span className={`flex h-5 w-5 items-center justify-center rounded-full ${l.d ? "bg-primary text-primary-foreground" : "border border-border bg-background"}`}>
                        {l.d ? "✓" : ""}
                      </span>
                      <span className={l.d ? "text-foreground" : "text-muted-foreground"}>{l.t}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-3xl bg-accent" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-primary md:text-4xl">Everything an institute needs</h2>
          <p className="mt-3 text-muted-foreground">
            Three roles, one streamlined workflow — from first lesson to first offer letter.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { i: BookOpen, t: "Course Management", d: "Trainers publish structured courses with lessons. Students enroll in one click." },
            { i: LineChart, t: "Progress Tracking", d: "Live progress bars and lesson-by-lesson completion built into each enrollment." },
            { i: ClipboardCheck, t: "Assignments", d: "Trainers create assignments, students submit work, evaluations are recorded." },
            { i: Briefcase, t: "Job Portal", d: "Admins post openings. Students apply directly from their dashboard." },
            { i: Users, t: "Role-based Access", d: "Admin, Trainer and Student each get a tailored dashboard and permissions." },
            { i: ShieldCheck, t: "Secure Auth", d: "JWT-based authentication with hashed passwords on the Node/Express backend." },
          ].map(({ i: Icon, t, d }) => (
            <div key={t} className="rounded-2xl border bg-card p-6 transition hover:shadow-soft">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t bg-card">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-muted-foreground">
          LearnHub
        </div>
      </footer>
    </div>
  );
}
