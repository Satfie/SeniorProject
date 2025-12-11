"use client"

import Link from "next/link"
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Bell,
  ChevronDown,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Shield,
  Sun,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context";
import { useNotifications } from "@/lib/notifications-context";
import { api, type JoinRequest } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type NavLink = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  show: (authenticated: boolean, isAdmin: boolean) => boolean;
};

const navLinks: NavLink[] = [
  { href: "/", label: "Home", icon: Home, show: () => true },
  {
    href: "/tournaments",
    label: "Tournaments",
    icon: Trophy,
    show: () => true,
  },
  { href: "/teams", label: "Teams", icon: Users, show: () => true },
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    show: (authed) => authed,
  },
  {
    href: "/admin",
    label: "Admin",
    icon: Shield,
    show: (_, isAdmin) => isAdmin,
  },
];

function ThemeToggle() {
  const { resolvedTheme, theme, setTheme } = useTheme();
  const isDark = (resolvedTheme ?? theme) === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="rounded-full"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

type ManagerJoinRequest = JoinRequest & {
  team?: { name?: string | null } | null;
  user?: { email?: string | null } | null;
};

export function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const {
    notifications,
    unreadCount,
    dismiss,
    refresh,
    clearAll,
    markAllRead,
  } = useNotifications();
  const displayName = user?.username || user?.email || "Account";

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [managerRequests, setManagerRequests] = useState<ManagerJoinRequest[]>([])
  const [managerUnread, setManagerUnread] = useState(0)

  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(target)
      ) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Poll manager join requests
  useEffect(() => {
    if (!user || user.role !== "team_manager") {
      setManagerRequests([]);
      setManagerUnread(0);
      return;
    }

    const load = async () => {
      try {
        const data = await api.getManagerJoinRequests();
        setManagerRequests(data);
        setManagerUnread(data.length);
      } catch {
        setManagerRequests([]);
        setManagerUnread(0);
      }
    };

    void load();
    const intervalId = setInterval(() => {
      void load();
    }, 15000);

    return () => {
      clearInterval(intervalId);
    };
  }, [user]);

  const handleManagerRequest = useCallback(async (request: ManagerJoinRequest, action: "approve" | "decline") => {
    if (action === "approve") {
      await api.approveJoinRequest(request.teamId, request.id);
    } else {
      await api.declineJoinRequest(request.teamId, request.id);
    }
    setManagerRequests((prev) => prev.filter((x) => x.id !== request.id));
    setManagerUnread((prev) => Math.max(0, prev - 1));
  }, []);

  const handleLogout = () => {
    void logout();
    setProfileOpen(false);
    setNotificationsOpen(false);
    setMobileMenuOpen(false);
  };

  const filteredLinks = navLinks.filter((link) => link.show(!!user, !!isAdmin));

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all group-hover:scale-110">
              <Logo size={36} />
            </div>
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-xl font-bold text-transparent group-hover:opacity-80 transition-opacity">
              Esport Shield
            </span>
          </Link>

          <div className="hidden items-center gap-6 md:flex">
            {filteredLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-all hover:text-primary hover:scale-105 relative group"
              >
                <link.icon className="h-4 w-4 group-hover:text-primary transition-colors" />
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            {user ? (
              <>
                <div ref={notificationsRef} className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 px-3 py-1 text-sm hover:bg-primary/10 transition-colors"
                    onClick={() => {
                      setNotificationsOpen((prev) => !prev);
                      void (async () => {
                        await refresh();
                        await markAllRead();
                      })();
                    }}
                    aria-expanded={notificationsOpen}
                    aria-haspopup="true"
                  >
                    <Bell className="h-4 w-4" />
                    {unreadCount + managerUnread > 0 ? (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground animate-pulse">
                        {unreadCount + managerUnread}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        No alerts
                      </span>
                    )}
                    <ChevronDown className={`h-4 w-4 opacity-70 transition-transform ${notificationsOpen ? 'rotate-180' : ''}`} />
                  </Button>
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 rounded-lg border border-border bg-popover/95 backdrop-blur shadow-xl animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex items-center justify-between border-b border-border px-4 py-2">
                        <p className="text-sm font-semibold">Notifications</p>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs hover:text-primary"
                            onClick={() => {
                              void refresh();
                            }}
                          >
                            Refresh
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs hover:text-destructive"
                            onClick={() => {
                              void clearAll();
                            }}
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                      <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        {/* Manager join requests */}
                        {user?.role === "team_manager" && (
                          <div className="px-4 py-3 border-b border-border bg-muted/30">
                            <p className="text-xs font-semibold mb-2 flex items-center gap-2">
                              <Users className="w-3 h-3" /> Join Requests
                            </p>
                            {managerRequests.length === 0 ? (
                              <p className="text-xs text-muted-foreground italic">
                                No pending requests
                              </p>
                            ) : (
                              managerRequests.map((r) => (
                                <div key={r.id} className="mb-2 last:mb-0 bg-background p-2 rounded border border-border">
                                  <p className="text-xs font-medium truncate mb-1">
                                    {r.user?.email || r.userId} →{" "}
                                    {r.team?.name || r.teamId}
                                  </p>
                                  <div className="flex gap-2">
                                    <Button
                                      size="sm"
                                      className="h-6 px-2 text-xs w-full bg-green-600 hover:bg-green-700 text-white"
                                      onClick={() => {
                                        void handleManagerRequest(r, "approve");
                                      }}
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 px-2 text-xs w-full hover:bg-destructive/10 hover:text-destructive"
                                      onClick={() => {
                                        void handleManagerRequest(r, "decline");
                                      }}
                                    >
                                      Decline
                                    </Button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                        {/* General notifications */}
                        {notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center text-muted-foreground">
                            <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                            <p className="text-sm">You are all caught up.</p>
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className="flex flex-col gap-2 border-b border-border px-4 py-3 last:border-none hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                  <p className="text-sm font-medium leading-snug">
                                    {notification.message}
                                  </p>
                                  {notification.createdAt && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {new Date(
                                        notification.createdAt
                                      ).toLocaleString()}
                                    </p>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
                                  onClick={() => dismiss(notification.id)}
                                  aria-label="Dismiss notification"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                              {notification.actionLabel &&
                                notification.onAction && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 px-3 text-xs self-start mt-1"
                                    onClick={() => {
                                      notification.onAction?.();
                                      setNotificationsOpen(false);
                                    }}
                                  >
                                    {notification.actionLabel}
                                  </Button>
                                )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div ref={profileRef} className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 px-3 py-1 text-sm hover:bg-primary/10 transition-colors rounded-full pl-1"
                    onClick={() => setProfileOpen((prev) => !prev)}
                    aria-haspopup="true"
                    aria-expanded={profileOpen}
                  >
                    <Avatar className="h-8 w-8 border-2 border-primary/20">
                      <AvatarImage
                        src={user?.avatarUrl || "/placeholder-user.jpg"}
                        alt={displayName}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {(displayName || "U").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="max-w-[100px] truncate font-medium hidden lg:block">
                      {displayName}
                    </span>
                    <ChevronDown className={`h-4 w-4 opacity-70 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                  </Button>
                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-popover/95 backdrop-blur shadow-xl animate-in fade-in zoom-in-95 duration-200 p-1">
                      <div className="px-3 py-2 border-b border-border mb-1">
                        <p className="text-sm font-medium truncate">{displayName}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-primary/10 hover:text-primary rounded-md transition-colors"
                        onClick={() => setProfileOpen(false)}
                      >
                        <Users className="w-4 h-4" />
                        My Profile
                      </Link>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-primary/10 hover:text-primary rounded-md transition-colors"
                        onClick={() => setProfileOpen(false)}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <div className="h-px bg-border my-1"></div>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="hover:bg-primary/10 hover:text-primary">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild size="sm" className="shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-105">
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )}
          </div>


          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            {user && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Notifications"
                onClick={() => {
                  setNotificationsOpen((prev) => !prev);
                  void refresh();
                }}
                className="relative rounded-full"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 min-h-[1.25rem] min-w-[1.25rem] rounded-full bg-primary px-1 text-xs font-semibold leading-5 text-primary-foreground">
                    {unreadCount}
                  </span>
                )}
              </Button>
            )}
            <button
              className="rounded-md p-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              type="button"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="space-y-4 border-t border-border py-4">
              {filteredLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 px-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-border pt-4">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.avatarUrl || "/placeholder-user.jpg"} alt={displayName} />
                        <AvatarFallback>
                          {(displayName || "U").slice(0,2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{displayName}</p>
                        <Link
                          href="/profile"
                          className="text-xs text-primary hover:underline"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          My Profile
                        </Link>
                      </div>
                    </div>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      size="sm"
                      className="mt-3 w-full bg-transparent"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button asChild variant="ghost" size="sm">
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Login
                      </Link>
                    </Button>
                    <Button asChild size="sm">
                      <Link
                        href="/register"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Register
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
            {notificationsOpen && user && (
              <div className="mb-4 rounded-lg border border-border bg-popover p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Notifications</p>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => {
                        void refresh();
                      }}
                    >
                      Refresh
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => {
                        void clearAll();
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
                <div className="mt-3 space-y-3">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      You are all caught up.
                    </p>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="rounded-md border border-border p-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium">
                              {notification.message}
                            </p>
                            {notification.createdAt && (
                              <p className="text-xs text-muted-foreground">
                                {new Date(
                                  notification.createdAt
                                ).toLocaleString()}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            className="rounded px-1 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => dismiss(notification.id)}
                            aria-label="Dismiss notification"
                          >
                            ×
                          </button>
                        </div>
                        {notification.actionLabel && notification.onAction && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 w-full bg-transparent text-xs"
                            onClick={() => {
                              notification.onAction?.();
                              setNotificationsOpen(false);
                              setMobileMenuOpen(false);
                            }}
                          >
                            {notification.actionLabel}
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
