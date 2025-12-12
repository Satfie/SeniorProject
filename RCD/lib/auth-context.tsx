"use client"

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
  useCallback,
} from "react";
import { api, type User } from "./api"
import { buildOAuthStartUrl } from "./oauth-client"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, username?: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  beginOAuth: (provider: string, mode?: "login" | "link", returnTo?: string) => void
  completeOAuthLogin: (token: string, returnTo?: string) => Promise<void>
  unlinkProvider: (provider: string) => Promise<void>
  setPassword: (newPassword: string, email?: string) => Promise<void>
  updateEmail: (email: string, password?: string) => Promise<void>
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>
  // Computed auth state helpers
  hasPasswordAuth: boolean
  hasOAuthOnly: boolean
  canDisconnectProvider: (provider: string) => boolean
  isAdmin: boolean
  isTeamManager: boolean
  isPlayer: boolean
  isGuest: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = useCallback(async (): Promise<void> => {
    try {
      const currentUser = await api.getCurrentUser();
      setUser(currentUser);
    } catch {
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("rcd_token");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("rcd_token")) {
      void fetchUser();
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  const login = useCallback(async (email: string, password: string) => {
    const { user: loggedInUser } = await api.login(email, password);
    setUser(loggedInUser);
    router.push("/dashboard");
  }, [router]);

  const register = useCallback(async (
    email: string,
    password: string,
    username?: string
  ) => {
    const { user: registeredUser } = await api.register(
      email,
      password,
      username
    );
    setUser(registeredUser);
    router.push("/dashboard");
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
      router.push("/");
    }
  }, [router]);

  const refreshUser = useCallback(() => {
    return fetchUser();
  }, [fetchUser]);

  const beginOAuth = useCallback(
    (provider: string, mode: "login" | "link" = "login", returnTo?: string) => {
      if (typeof window === "undefined") return;
      const token =
        mode === "link" ? localStorage.getItem("rcd_token") || undefined : undefined;
      const url = buildOAuthStartUrl(provider, { mode, token, returnTo });
      window.location.href = url;
    },
    []
  );

  const completeOAuthLogin = useCallback(
    async (token: string, returnTo?: string) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("rcd_token", token);
      }
      await fetchUser();
      router.push(returnTo || "/dashboard");
    },
    [fetchUser, router]
  );

  const unlinkProvider = useCallback(
    async (provider: string) => {
      await api.unlinkProvider(provider);
      await refreshUser();
    },
    [refreshUser]
  );

  const setPassword = useCallback(
    async (newPassword: string, email?: string) => {
      await api.setPassword(newPassword, email);
      await refreshUser();
    },
    [refreshUser]
  );

  const updateEmail = useCallback(
    async (email: string, password?: string) => {
      await api.updateEmail(email, password);
      await refreshUser();
    },
    [refreshUser]
  );

  const changePassword = useCallback(
    async (oldPassword: string, newPassword: string) => {
      await api.changePassword(oldPassword, newPassword);
    },
    []
  );

  // Listen for team approval event to refresh user (updates teamId immediately after notification)
  const handleTeamApproved = useCallback(() => {
    void refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.addEventListener("rcd:team-approved", handleTeamApproved);
    return () =>
      window.removeEventListener("rcd:team-approved", handleTeamApproved);
  }, [handleTeamApproved]);

  // Computed auth helpers
  const hasPasswordAuth = Boolean(user?.authMethods?.password);
  const hasOAuthOnly = Boolean(
    !hasPasswordAuth && 
    user?.providers?.some(p => p.provider !== 'password')
  );
  
  const canDisconnectProvider = useCallback(
    (provider: string) => {
      if (!user) return false;
      if (provider === 'password') return false;
      const authCount = user.authMethods?.count ?? 0;
      return authCount > 1;
    },
    [user]
  );

  const isAdmin = user?.role === "admin";
  const isTeamManager = user?.role === "team_manager";
  const isPlayer = user?.role === "player";
  const isGuest = !user || user?.role === "guest";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        beginOAuth,
        completeOAuthLogin,
        unlinkProvider,
        setPassword,
        updateEmail,
        changePassword,
        hasPasswordAuth,
        hasOAuthOnly,
        canDisconnectProvider,
        isAdmin,
        isTeamManager,
        isPlayer,
        isGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
