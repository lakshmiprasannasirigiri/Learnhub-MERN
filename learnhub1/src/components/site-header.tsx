import { Link, useRouter } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogOut, User as UserIcon } from "lucide-react";

export function SiteHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const dashHref =
    user?.role === "admin" ? "/admin" : user?.role === "trainer" ? "/trainer" : "/dashboard";

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-primary">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg lh-gradient text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="text-lg tracking-tight">LearnHub</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <Link to="/courses" className="hover:text-foreground">Courses</Link>
          {user && <Link to={dashHref} className="hover:text-foreground">Dashboard</Link>}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <div className="hidden items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground sm:flex">
                <UserIcon className="h-3.5 w-3.5" />
                {user.name} · <span className="capitalize">{user.role}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  logout();
                  router.navigate({ to: "/" });
                }}
              >
                <LogOut className="h-4 w-4" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
