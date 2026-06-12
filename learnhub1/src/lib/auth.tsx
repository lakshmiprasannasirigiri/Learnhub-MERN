import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, type User } from "./api";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, role: User["role"]) => Promise<User>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = localStorage.getItem("lh_token");
    if (!t) {
      setLoading(false);
      return;
    }
    api.me()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("lh_token");
      })
      .finally(() => setLoading(false));
  }, []);

  const value: AuthCtx = {
    user,
    loading,
    async login(email, password) {
      const { token, user } = await api.login({ email, password });
      localStorage.setItem("lh_token", token);
      setUser(user);
      return user;
    },
    async register(name, email, password, role) {
      const { token, user } = await api.register({ name, email, password, role });
      localStorage.setItem("lh_token", token);
      setUser(user);
      return user;
    },
    logout() {
      localStorage.removeItem("lh_token");
      localStorage.removeItem("lh_mock_session");
      setUser(null);
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}
