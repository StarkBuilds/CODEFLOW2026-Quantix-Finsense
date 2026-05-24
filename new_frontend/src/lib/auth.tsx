import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Role = "admin" | "user";

type User = {
  id: string;
  email: string;
};

type AuthCtx = {
  session: string | null;
  user: User | null;
  roles: Role[];
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  signIn: (token: string, user: User, roles?: Role[]) => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("finsense_token");
    const userStr = localStorage.getItem("finsense_user");
    if (token && userStr) {
      setSession(token);
      try {
        const u = JSON.parse(userStr);
        setUser(u);
        setRoles(u.roles || []);
      } catch (e) {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const signIn = (token: string, u: User, r: Role[] = []) => {
    localStorage.setItem("finsense_token", token);
    localStorage.setItem("finsense_user", JSON.stringify({ ...u, roles: r }));
    setSession(token);
    setUser(u);
    setRoles(r);
  };

  const signOut = async () => {
    localStorage.removeItem("finsense_token");
    localStorage.removeItem("finsense_user");
    setSession(null);
    setUser(null);
    setRoles([]);
  };

  return (
    <Ctx.Provider
      value={{
        session,
        user,
        roles,
        loading,
        isAdmin: roles.includes("admin"),
        signOut,
        signIn,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
