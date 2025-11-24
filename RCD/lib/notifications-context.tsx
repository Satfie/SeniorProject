"use client"
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { toast } from "sonner";

const FORCE_DIRECT_API =
  (process.env.NEXT_PUBLIC_FORCE_DIRECT_API || "")
    .toLowerCase()
    .trim() === "true";

function resolveClientApiBase() {
  let base = process.env.NEXT_PUBLIC_API_URL || "";
  if (!base) return "";
  base = base.replace(/\/$/, "");
  if (typeof window !== "undefined") {
    try {
      const url = new URL(base);
      const host = url.hostname;
      const isLikelyDockerHost =
        !host.includes(".") && host !== "localhost" && host !== "127.0.0.1";
      if (isLikelyDockerHost && host !== window.location.hostname) {
        url.hostname = window.location.hostname;
        base = url.toString().replace(/\/$/, "");
      }
    } catch {
      // Keep original base on parse failures
    }
  }
  return base;
}

// Lightweight stub aligning with esports-rcd-frontend interface to satisfy imports in shared code builds.
export type Notification = {
  id: string;
  type: "info" | "warning" | "success" | "action";
  message: string;
  createdAt: string;
  actionLabel?: string;
  actionPath?: string;
  onAction?: () => void;
  read?: boolean;
  metadata?: Record<string, unknown>;
};

type NotificationsContextValue = {
  notifications: Notification[];
  unreadCount: number;
  dismiss: (id: string) => void;
  refresh: () => Promise<void>;
  clearAll: () => Promise<void>;
  markAllRead: () => Promise<void>;
  addNotification: (notification: {
    message: string;
    type?: Notification["type"];
    id?: string;
    createdAt?: string | number;
    actionLabel?: string;
    actionPath?: string;
    onAction?: () => void;
    metadata?: Record<string, unknown>;
  }) => void;
};

const NotificationsContext = createContext<
  NotificationsContextValue | undefined
>(undefined);

function uuid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID)
    return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}

function deriveActionPath(payload: any): string | undefined {
  if (typeof payload?.actionPath === "string" && payload.actionPath.length > 0) {
    return payload.actionPath;
  }
  if (typeof payload?.metadata?.path === "string" && payload.metadata.path.length > 0) {
    return payload.metadata.path;
  }
  const teamId = payload?.metadata?.teamId || payload?.teamId;
  if (typeof teamId === "string" && teamId.length > 0) {
    return `/teams/${teamId}`;
  }
  const tournamentId = payload?.metadata?.tournamentId || payload?.tournamentId;
  if (typeof tournamentId === "string" && tournamentId.length > 0) {
    return `/tournaments/${tournamentId}`;
  }
  return undefined;
}

function deriveActionLabel(payload: any, actionPath?: string): string | undefined {
  const directLabel =
    typeof payload?.actionLabel === "string"
      ? payload.actionLabel
      : typeof payload?.metadata?.actionLabel === "string"
      ? payload.metadata.actionLabel
      : undefined;
  if (directLabel) return directLabel;
  if (!actionPath) return undefined;
  if (actionPath.startsWith("/tournaments/")) return "View Tournament";
  if (actionPath.startsWith("/teams/")) return "View Team";
  if (actionPath.startsWith("/dashboard")) return "View Dashboard";
  return undefined;
}

function buildOnAction(actionPath?: string, fallback?: () => void) {
  if (typeof fallback === "function") return fallback;
  if (!actionPath) return undefined;
  return () => {
    if (typeof window === "undefined") return;
    window.location.href = actionPath;
  };
}

function normalizeNotificationPayload(payload: any): Notification {
  const id = String(payload?.id || payload?._id || uuid());
  const createdAt = payload?.createdAt
    ? new Date(payload.createdAt).toISOString()
    : new Date().toISOString();
  const actionPath = deriveActionPath(payload);
  const actionLabel = deriveActionLabel(payload, actionPath);
  return {
    id,
    type: (payload?.type as Notification["type"]) || "info",
    message: payload?.message || "",
    createdAt,
    actionLabel,
    actionPath,
    onAction: buildOnAction(actionPath, payload?.onAction),
    read: typeof payload?.read === "boolean" ? payload.read : false,
    metadata: payload?.metadata,
  };
}

export function NotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const apiBase = resolveClientApiBase();
  const useDirectBase = useMemo(
    () => Boolean(apiBase && FORCE_DIRECT_API),
    [apiBase]
  );
  const buildUrl = useCallback(
    (path: string) => (useDirectBase ? `${apiBase}${path}` : path),
    [apiBase, useDirectBase]
  );
  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("rcd_token") : null;
      if (token) {
        fetch(buildUrl(`/api/notifications/${encodeURIComponent(id)}`), {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }
    } catch {}
  }, [buildUrl]);
  const clearAll = useCallback(async () => {
    setNotifications([]);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("rcd_token") : null;
      if (!token) return;
      await fetch(buildUrl(`/api/notifications`), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
  }, [buildUrl]);
  const addNotification: NotificationsContextValue["addNotification"] =
    useCallback((n) => {
      const normalized = normalizeNotificationPayload(n);
      normalized.read = false;
      setNotifications((prev) => [
        normalized,
        ...prev.filter((x) => x.id !== normalized.id),
      ]);
    }, []);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("rcd_token") : null;
      if (!token) return;
      const res = await fetch(buildUrl(`/api/notifications`), { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        if (res.status >= 500) {
          const err = await res.json().catch(() => ({}));
          console.error("Notifications fetch server error", err);
          try {
            toast("Failed to load notifications", { description: err.message || `HTTP ${res.status}` });
          } catch {}
        }
        return;
      }
      const raw = await res.json();
      const mapped: Notification[] = (raw || []).map((r: any) => normalizeNotificationPayload(r));
      setNotifications((prev) => {
        const prevIds = new Set(prev.map((p) => p.id));
        const mappedIds = new Set(mapped.map((m) => m.id));
        const newlyAdded = mapped.filter((m) => !prevIds.has(m.id));
        newlyAdded.forEach((n) => {
          try {
            toast(n.message, { description: new Date(n.createdAt).toLocaleString() });
          } catch {}
          if (n.type === "success" && /approved to join team/i.test(n.message)) {
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("rcd:team-approved"));
            }
          }
        });
        return [
          ...mapped,
          ...prev.filter((p) => !mappedIds.has(p.id)),
        ];
      });
    } catch {
    } finally {
      setLoading(false);
    }
  }, [buildUrl]);
  const refresh = useCallback(() => {
    return load();
  }, [load]);

  const markAllRead = useCallback(async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("rcd_token") : null;
      if (!token) return;
      await fetch(buildUrl(`/api/notifications/read`), { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  }, [buildUrl]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("rcd_token");
    if (!token) return; // defer until token exists
    void load();
    let cleanup: (() => void) | undefined;
    if (token && typeof EventSource !== "undefined") {
      let stopped = false;
      let source: EventSource | null = null;
      let retryMs = 2000;
      const connect = () => {
        if (stopped) return;
        const streamUrl = buildUrl(`/api/notifications/stream?token=${encodeURIComponent(token)}`);
        source = new EventSource(streamUrl);
        const onNotification = (event: MessageEvent) => {
          try {
            const payload = JSON.parse(event.data) as any;
            const mapped = normalizeNotificationPayload(payload);
            setNotifications((prev) => [mapped, ...prev.filter((n) => n.id !== mapped.id)]);
          } catch (err) {
            console.error("Failed to parse notification payload", err);
          }
        };
        // Some servers send named events; also handle default message
        source.addEventListener("notification", onNotification as any);
        source.onmessage = onNotification;
        source.onopen = () => {
          retryMs = 2000;
        };
        source.onerror = () => {
          try {
            if (source) source.close();
          } catch {}
          if (stopped) return;
          setTimeout(connect, retryMs);
          retryMs = Math.min(retryMs * 2, 15000);
        };
      };
      connect();
      const fallback = setInterval(() => {
        void load();
      }, 5 * 60_000);
      cleanup = () => {
        stopped = true;
        try {
          if (source) source.close();
        } catch {}
        clearInterval(fallback);
      };
      return cleanup;
    } else {
      const interval = setInterval(() => {
        const currentToken = localStorage.getItem("rcd_token");
        if (!currentToken) return; // skip while logged out
        void load();
      }, 15000);
      cleanup = () => clearInterval(interval);
      return cleanup;
    }
  }, [buildUrl, load]);

  // Secondary effect: when token appears after login, trigger initial load
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("rcd_token");
    if (token && notifications.length === 0 && !loading) {
      void load();
    }
  }, [notifications.length, loading, load]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      dismiss,
      refresh,
      clearAll,
      addNotification,
      markAllRead,
    }),
    [
      notifications,
      unreadCount,
      dismiss,
      refresh,
      clearAll,
      addNotification,
      markAllRead,
    ]
  );
  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (ctx) return ctx;
  // Fallback no-op context to avoid hard crashes if provider isn't mounted yet
  return {
    notifications: [],
    unreadCount: 0,
    dismiss: () => {},
    refresh: async () => {},
    clearAll: async () => {},
    markAllRead: async () => {},
    addNotification: () => {},
  };
}
