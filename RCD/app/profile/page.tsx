"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, User, Gamepad2, Globe, Lock, Camera, Mail, MapPin, Clock, Trophy, Activity, Zap, Award, Link2, Unplug, AlertTriangle } from "lucide-react";
import { toast } from "sonner"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AnimatedSection } from "@/components/ui/animated-section"

function countryToFlag(code: string): string {
  if (!code) return "🏳️"
  const cc = code.trim().toUpperCase()
  if (cc.length !== 2) return cc
  const A = 0x1F1E6
  const base = "A".charCodeAt(0)
  const chars = [...cc].map((c) => String.fromCodePoint(A + (c.charCodeAt(0) - base)))
  return chars.join("")
}

function labelForGameId(key: string): string {
  const map: Record<string,string> = {
    playstation: "PlayStation",
    pubgMobile: "PUBG Mobile",
    rocketLeague: "Rocket League",
    activision: "Activision",
    riot: "Riot",
    r6s: "R6S",
    mobileLegends: "Mobile Legends",
    battleNet: "Battle.net",
    steam: "Steam",
    codMobile: "CoD Mobile",
    streetFighter: "Street Fighter",
    smashBros: "Smash Bros",
  }
  return map[key] || key
}

const oauthAccounts = [
  { provider: "discord", label: "Discord" },
  { provider: "google", label: "Google" },
];

function ProfileContent() {
  const { user, refreshUser, beginOAuth, unlinkProvider } = useAuth()
  const [editing, setEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "gameIds" | "general">("overview")
  const [username, setUsername] = useState(user?.username || "")
  const [email, setEmail] = useState(user?.email || "")
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user?.avatarUrl)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [country, setCountry] = useState(user?.country || "BH")
  const [timezone, setTimezone] = useState(user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone)
  const [region, setRegion] = useState(user?.region || "")
  const [gameIds, setGameIds] = useState<Record<string, string>>({
    playstation: user?.gameIds?.playstation || "",
    pubgMobile: user?.gameIds?.pubgMobile || "",
    rocketLeague: user?.gameIds?.rocketLeague || "",
    activision: user?.gameIds?.activision || "",
    riot: user?.gameIds?.riot || "",
    r6s: user?.gameIds?.r6s || "",
    mobileLegends: user?.gameIds?.mobileLegends || "",
    battleNet: user?.gameIds?.battleNet || "",
    steam: user?.gameIds?.steam || "",
    codMobile: user?.gameIds?.codMobile || "",
    streetFighter: user?.gameIds?.streetFighter || "",
    smashBros: user?.gameIds?.smashBros || "",
  })
  const [social, setSocial] = useState<Record<string, string>>({
    snapchat: user?.social?.snapchat || "",
    youtube: user?.social?.youtube || "",
    discord: user?.social?.discord || "",
    twitch: user?.social?.twitch || "",
    twitter: user?.social?.twitter || "",
    instagram: user?.social?.instagram || "",
  })
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [providerBusy, setProviderBusy] = useState<string | null>(null)

  const connectedProviders = user?.providers || []
  const needsVerifiedEmail = !user?.email || user.email.endsWith("@oauth.local")

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    const wantsPasswordChange = !!(
      currentPassword ||
      newPassword ||
      confirmPassword
    );

    if (wantsPasswordChange) {
      if (!currentPassword || !newPassword || !confirmPassword) {
        toast.error("Please fill in all password fields");
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error("New passwords do not match");
        return;
      }
      if (newPassword.length < 8) {
        toast.error("Password must be at least 8 characters");
        return;
      }
    }

    setLoading(true)
    try {
      await api.updateUser(user.id, {
        username: username || undefined,
        email: email || undefined,
        avatarUrl: avatarPreview,
        gameIds,
        social,
        timezone,
        country,
        region: region || undefined,
      })
      toast.success("Profile updated successfully")
      if (wantsPasswordChange) {
        toast.success("Password changed successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
      await refreshUser()
      setEditing(false)
      setActiveTab("overview")
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const onPickAvatar = () => fileInputRef.current?.click()
  const onAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file")
      return
    }
    const maxBytes = 2 * 1024 * 1024 // 2MB
    if (file.size > maxBytes) {
      toast.error("Image must be under 2MB")
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      setAvatarPreview(result)
    }
    reader.readAsDataURL(file)
  }
  const onRemoveAvatar = () => setAvatarPreview("/placeholder-user.jpg")

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Header */}
      <div className="relative h-[250px] w-full overflow-hidden mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-900/20 to-background z-10"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 z-0"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow"></div>

        <div className="container mx-auto px-4 h-full relative z-20 flex flex-col justify-center">
          <AnimatedSection>
            <div className="flex items-center gap-6">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-full opacity-75 group-hover:opacity-100 blur transition duration-1000 group-hover:duration-200"></div>
                <Avatar className="h-24 w-24 ring-4 ring-background relative">
                  <AvatarImage
                    src={
                      (editing ? avatarPreview : user?.avatarUrl) ||
                      "/placeholder-user.jpg"
                    }
                    alt={user?.username || user?.email || "avatar"}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-2xl font-bold bg-background text-foreground">
                    {(user?.username || user?.email || "U")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {editing && (
                  <>
                    <button
                      type="button"
                      onClick={onPickAvatar}
                      className="absolute bottom-0 right-0 rounded-full bg-primary text-primary-foreground p-2 shadow-lg hover:bg-primary/90 transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onAvatarFileChange}
                    />
                  </>
                )}
              </div>
              
              <div>
                <h1 className="text-4xl font-black tracking-tight text-foreground drop-shadow-lg flex items-center gap-3">
                  {user?.username || "Player"}
                  {user?.role === "admin" && (
                    <Badge variant="destructive" className="text-sm px-2 py-0.5">Admin</Badge>
                  )}
                  {user?.role === "team_manager" && (
                    <Badge variant="secondary" className="text-sm px-2 py-0.5 bg-purple-500/20 text-purple-300 border-purple-500/30">Manager</Badge>
                  )}
                </h1>
                <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4" />
                    {user?.email}
                  </span>
                  {country && (
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-4 h-4" />
                      {countryToFlag(country)} {country}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8 relative z-30 max-w-5xl space-y-6">
        {needsVerifiedEmail && (
          <AnimatedSection delay={50}>
            <Card className="border-yellow-500/30 bg-yellow-500/5 backdrop-blur">
              <CardContent className="flex flex-col md:flex-row items-start md:items-center gap-4 py-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="font-semibold text-yellow-500">Add a real email address</p>
                    <p className="text-xs text-yellow-200/80">
                      We couldn&apos;t get an email from your provider. Update it now to receive tournament updates.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="ml-auto border-yellow-500/40 text-yellow-500 hover:bg-yellow-500/10"
                  onClick={() => {
                    setEditing(true)
                    setActiveTab("general")
                  }}
                >
                  Update email
                </Button>
              </CardContent>
            </Card>
          </AnimatedSection>
        )}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1 space-y-6">
            <AnimatedSection delay={100}>
              <Card className="border-primary/10 bg-card/40 backdrop-blur overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col">
                    <button
                      onClick={() => {
                        if (editing) setActiveTab("overview");
                        else setEditing(false);
                      }}
                      className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors border-l-2 ${
                        !editing 
                          ? "bg-primary/10 text-primary border-primary" 
                          : "hover:bg-white/5 border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <User className="w-4 h-4" />
                      Profile Overview
                    </button>
                    <button
                      onClick={() => {
                        setEditing(true);
                        setActiveTab("general");
                      }}
                      className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors border-l-2 ${
                        editing && activeTab === "general"
                          ? "bg-primary/10 text-primary border-primary" 
                          : "hover:bg-white/5 border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Zap className="w-4 h-4" />
                      Edit Details
                    </button>
                    <button
                      onClick={() => {
                        setEditing(true);
                        setActiveTab("gameIds");
                      }}
                      className={`flex items-center gap-3 px-6 py-4 text-sm font-medium transition-colors border-l-2 ${
                        editing && activeTab === "gameIds"
                          ? "bg-primary/10 text-primary border-primary" 
                          : "hover:bg-white/5 border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Gamepad2 className="w-4 h-4" />
                      Game IDs & Socials
                    </button>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>

            {!editing && (
              <AnimatedSection delay={200}>
                <Card className="border-primary/10 bg-card/40 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />
                      Stats Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-background/40 rounded-lg border border-white/5">
                      <span className="text-sm text-muted-foreground">Matches</span>
                      <span className="font-bold">0</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-background/40 rounded-lg border border-white/5">
                      <span className="text-sm text-muted-foreground">Win Rate</span>
                      <span className="font-bold text-green-400">0.0%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-background/40 rounded-lg border border-white/5">
                      <span className="text-sm text-muted-foreground">Trophies</span>
                      <span className="font-bold text-yellow-500">0</span>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <AnimatedSection delay={150}>
              <Card className="border-primary/10 bg-card/40 backdrop-blur min-h-[500px]">
                <CardHeader>
                  <CardTitle>
                    {editing 
                      ? (activeTab === "general" ? "Edit Personal Details" : "Manage Game IDs") 
                      : "Profile Overview"}
                  </CardTitle>
                  <CardDescription>
                    {editing 
                      ? "Update your information below" 
                      : "Your public profile information"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {editing ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      {activeTab === "gameIds" && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                          <div>
                            <h3 className="mb-4 text-sm font-semibold flex items-center gap-2 text-primary">
                              <Gamepad2 className="w-4 h-4" />
                              Game Identifiers
                            </h3>
                            <div className="grid gap-4 md:grid-cols-2">
                              {Object.entries(gameIds).map(([k, v]) => (
                                <div key={k} className="space-y-2">
                                  <Label className="capitalize text-xs text-muted-foreground">
                                    {labelForGameId(k)}
                                  </Label>
                                  <Input
                                    value={v}
                                    onChange={(e) =>
                                      setGameIds((s) => ({
                                        ...s,
                                        [k]: e.target.value,
                                      }))
                                    }
                                    placeholder={`Enter ID`}
                                    disabled={loading}
                                    className="bg-background/50 border-white/10 focus:border-primary/50 transition-colors"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <Separator className="bg-white/10" />
                          
                          <div>
                            <h3 className="mb-4 text-sm font-semibold flex items-center gap-2 text-primary">
                              <Globe className="w-4 h-4" />
                              Social Media
                            </h3>
                            <div className="grid gap-4 md:grid-cols-2">
                              {Object.entries(social).map(([k, v]) => (
                                <div key={k} className="space-y-2">
                                  <Label className="capitalize text-xs text-muted-foreground">{k}</Label>
                                  <div className="relative">
                                    <Input
                                      value={v}
                                      onChange={(e) =>
                                        setSocial((s) => ({
                                          ...s,
                                          [k]: e.target.value,
                                        }))
                                      }
                                      placeholder={`username`}
                                      disabled={loading}
                                      className="bg-background/50 border-white/10 pl-8 focus:border-primary/50 transition-colors"
                                    />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">@</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === "general" && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                          <div className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="username">Username</Label>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                  id="username"
                                  placeholder="Enter username"
                                  value={username}
                                  onChange={(e) => setUsername(e.target.value)}
                                  disabled={loading}
                                  className="pl-10 bg-background/50 border-white/10"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                  id="email"
                                  type="email"
                                  placeholder="Enter email"
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  disabled={loading}
                                  className="pl-10 bg-background/50 border-white/10"
                                />
                              </div>
                            </div>
                          </div>
                          
                          <Separator className="bg-white/10" />
                          
                          <div className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="country">Country (ISO Code)</Label>
                              <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                  id="country"
                                  placeholder="e.g., BH"
                                  value={country}
                                  onChange={(e) =>
                                    setCountry(e.target.value.toUpperCase())
                                  }
                                  disabled={loading}
                                  className="pl-10 bg-background/50 border-white/10"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="timezone">Timezone</Label>
                              <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                  id="timezone"
                                  placeholder="Region/City"
                                  value={timezone}
                                  onChange={(e) => setTimezone(e.target.value)}
                                  disabled={loading}
                                  className="pl-10 bg-background/50 border-white/10"
                                />
                              </div>
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                              <Label htmlFor="region">Region</Label>
                              <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                  id="region"
                                  placeholder="Optional region"
                                  value={region}
                                  onChange={(e) => setRegion(e.target.value)}
                                  disabled={loading}
                                  className="pl-10 bg-background/50 border-white/10"
                                />
                              </div>
                            </div>
                          </div>
                          
                          <Separator className="bg-white/10" />
                          
                          <div className="space-y-4 p-4 rounded-xl bg-background/30 border border-white/5">
                            <h3 className="text-sm font-semibold flex items-center gap-2">
                              <Lock className="w-4 h-4 text-primary" />
                              Change Password
                            </h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="current-password">
                                  Current Password
                                </Label>
                                <Input
                                  id="current-password"
                                  type="password"
                                  placeholder="Enter current password"
                                  value={currentPassword}
                                  onChange={(e) => setCurrentPassword(e.target.value)}
                                  disabled={loading}
                                  className="bg-background/50 border-white/10"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <Input
                                  id="new-password"
                                  type="password"
                                  placeholder="Enter new password"
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  disabled={loading}
                                  className="bg-background/50 border-white/10"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="confirm-new-password">
                                  Confirm New Password
                                </Label>
                                <Input
                                  id="confirm-new-password"
                                  type="password"
                                  placeholder="Re-enter new password"
                                  value={confirmPassword}
                                  onChange={(e) => setConfirmPassword(e.target.value)}
                                  disabled={loading}
                                  className="bg-background/50 border-white/10"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setEditing(false);
                            setActiveTab("overview");
                          }}
                          disabled={loading}
                          className="border-white/10 hover:bg-white/5"
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="shadow-lg shadow-primary/20">
                          {loading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      {/* Overview Tab (read-only) */}
                      
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold flex items-center gap-2 text-primary">
                          <Link2 className="w-4 h-4" />
                          Linked Accounts
                        </h3>
                        <div className="space-y-3">
                          {oauthAccounts.map(({ provider, label }) => {
                            const providerEntry = connectedProviders.find((p) => p.provider === provider)
                            const isConnected = Boolean(providerEntry)
                            return (
                              <div key={provider} className="flex items-center justify-between p-4 rounded-xl bg-background/40 border border-white/5">
                                <div>
                                  <p className="font-medium">{label}</p>
                                  {isConnected ? (
                                    <p className="text-xs text-muted-foreground">
                                      Connected{" "}
                                      {providerEntry?.linkedAt
                                        ? new Date(providerEntry.linkedAt).toLocaleDateString()
                                        : ""}
                                    </p>
                                  ) : (
                                    <p className="text-xs text-muted-foreground">Not connected</p>
                                  )}
                                </div>
                                {isConnected ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-white/10"
                                    disabled={providerBusy === provider}
                                    onClick={async () => {
                                      setProviderBusy(provider)
                                      try {
                                        await unlinkProvider(provider)
                                        toast.success(`${label} disconnected`)
                                      } catch (error: any) {
                                        toast.error(error?.message || `Failed to disconnect ${label}`)
                                      } finally {
                                        setProviderBusy(null)
                                      }
                                    }}
                                  >
                                    <Unplug className="w-4 h-4 mr-2" />
                                    Disconnect
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    className="shadow-primary/20 shadow-lg"
                                    onClick={() => beginOAuth(provider, "link", "/profile")}
                                  >
                                    <Link2 className="w-4 h-4 mr-2" />
                                    Connect
                                  </Button>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      <Separator className="bg-white/10" />

                      {/* Game IDs (read-only) */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold flex items-center gap-2 text-primary">
                          <Gamepad2 className="w-4 h-4" />
                          Game IDs & Handles
                        </h3>
                        <div className="grid gap-4 md:grid-cols-2">
                          {Object.entries(user?.gameIds || {}).filter(([, v]) => !!v)
                            .length === 0 ? (
                            <div className="col-span-full text-center py-8 bg-background/30 rounded-xl border border-dashed border-white/10">
                              <Gamepad2 className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">
                                No game IDs added yet.
                              </p>
                              <Button variant="link" onClick={() => { setEditing(true); setActiveTab("gameIds"); }} className="text-primary">
                                Add Game IDs
                              </Button>
                            </div>
                          ) : (
                            Object.entries(user?.gameIds || {})
                              .filter(([, v]) => v)
                              .map(([k, v]) => (
                                <div
                                  key={k}
                                  className="flex items-center justify-between p-4 rounded-xl bg-background/40 border border-white/5 hover:border-primary/20 transition-colors"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                      <Gamepad2 className="w-4 h-4 text-primary" />
                                    </div>
                                    <div>
                                      <div className="text-xs text-muted-foreground capitalize">
                                        {labelForGameId(k)}
                                      </div>
                                      <div className="font-medium break-all">
                                        {String(v)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))
                          )}
                        </div>
                      </div>

                      <Separator className="bg-white/10" />

                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold flex items-center gap-2 text-primary">
                          <Award className="w-4 h-4" />
                          Achievements
                        </h3>
                        <div className="grid gap-4 sm:grid-cols-3">
                          <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-transparent border border-yellow-500/20 flex flex-col items-center text-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500">
                              <Trophy className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold text-yellow-500">Early Adopter</p>
                              <p className="text-xs text-muted-foreground">Joined during beta</p>
                            </div>
                          </div>
                          {/* Placeholders for future achievements */}
                          <div className="p-4 rounded-xl bg-background/30 border border-white/5 flex flex-col items-center text-center gap-2 opacity-50">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                              <Lock className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-medium">Tournament Winner</p>
                              <p className="text-xs text-muted-foreground">Win 1 tournament</p>
                            </div>
                          </div>
                          <div className="p-4 rounded-xl bg-background/30 border border-white/5 flex flex-col items-center text-center gap-2 opacity-50">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                              <Lock className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-medium">Team Captain</p>
                              <p className="text-xs text-muted-foreground">Lead a team</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute requireAuth>
      <ProfileContent />
    </ProtectedRoute>
  )
}
