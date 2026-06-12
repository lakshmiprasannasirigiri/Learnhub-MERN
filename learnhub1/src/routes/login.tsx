import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/login")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Sign in · LearnHub" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/login" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      toast.success(`Welcome back, ${user.name}`);
      const dest =
        search.redirect ||
        (user.role === "admin" ? "/admin" : user.role === "trainer" ? "/trainer" : "/dashboard");
      navigate({ to: dest });
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  function quickFill(role: "admin" | "trainer" | "student") {
    setEmail(`${role}@learnhub.io`);
    setPassword(`${role}123`);
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto flex max-w-md flex-col px-4 py-16">
        <h1 className="text-3xl font-bold text-primary">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to continue learning.</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-2xl border bg-card p-6 shadow-soft">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            New here? <Link to="/register" className="font-medium text-primary hover:underline">Create an account</Link>
          </p>
        </form>

        <div className="mt-6 rounded-xl border border-dashed bg-accent/40 p-4 text-xs">
          <p className="font-semibold text-primary">Try a demo account</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(["admin", "trainer", "student"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => quickFill(r)}
                className="rounded-full bg-card px-3 py-1 font-medium capitalize text-primary hover:bg-primary hover:text-primary-foreground"
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
