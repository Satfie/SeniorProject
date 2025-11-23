"use client"

import { useEffect, useState } from "react"
import { api, type Team } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Shield,
  UserPlus,
  Check,
  XCircle,
  Clock,
  Trophy,
  Users,
  Calendar,
  Activity
} from "lucide-react";
import { toast } from "sonner"
import { AnimatedSection } from "@/components/ui/animated-section"

export default function TeamDetailPage() {
  const rawParams = useParams();
  const id = (rawParams as any)?.id as string | undefined;
  const router = useRouter()
  const { user, isPlayer } = useAuth()
  const [team, setTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)
  const [pendingRequests, setPendingRequests] = useState<any[]>([])
  const [myPending, setMyPending] = useState<any | null>(null);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [refreshToggle, setRefreshToggle] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editTag, setEditTag] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  // Removal dialog state
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [removeTargetId, setRemoveTargetId] = useState<string | null>(null)
  const [removeReason, setRemoveReason] = useState("")
  const [removingMember, setRemovingMember] = useState(false)

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        if (!id) return;
        const data = await api.getTeam(id);
        setTeam(data);
      } catch (error) {
        toast.error("Failed to load team");
        router.push("/teams");
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [id, router]);

  // Load pending join requests (manager view) & detect user's own pending request
  useEffect(() => {
    const loadRequests = async () => {
      if (!id || !user) return;
      setLoadingRequests(true);
      try {
        const list = await api.getTeamJoinRequests(id);
        const pending = list.filter((r: any) => r.status === "pending");
        setPendingRequests(user.id === team?.managerId ? pending : []);
        setMyPending(pending.find((r: any) => r.userId === user.id) || null);
      } catch {
        setPendingRequests([]);
        setMyPending(null);
      } finally {
        setLoadingRequests(false);
      }
    };
    loadRequests();
  }, [id, user, team?.managerId, refreshToggle]);

  const handleRequestToJoin = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!id) return;
    setRequesting(true)
    try {
      await api.requestToJoinTeam(id);
      toast.success("Join request sent successfully!");
      setRefreshToggle((t) => t + 1);
    } catch (error: any) {
      toast.error(error.message || "Failed to send join request");
    } finally {
      setRequesting(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="animate-pulse bg-card/40 backdrop-blur border-white/5">
          <CardHeader>
            <div className="h-8 bg-muted/20 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-muted/20 rounded w-3/4"></div>
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-muted/20 rounded"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!team) {
    return null
  }

  const isManager = user?.id === team.managerId
  const isCaptain = !!(team && user && team.captainIds && team.captainIds.includes(user.id))
  const refreshRequests = () => setRefreshToggle(t => t + 1)

  const approve = async (reqId: string) => {
    if (!id) return;
    try {
      await api.approveJoinRequest(id, reqId);
      toast.success('Request approved');
      refreshRequests();
      // refresh team members
      const data = await api.getTeam(id);
      setTeam(data)
    } catch (e: any) {
      toast.error(e?.message || 'Failed to approve');
    }
  }

  const decline = async (reqId: string) => {
    if (!id) return;
    try {
      await api.declineJoinRequest(id, reqId);
      toast.info('Request declined');
      refreshRequests();
    } catch (e: any) {
      toast.error(e?.message || 'Failed to decline');
    }
  }

  const openProfileEditor = () => {
    if (!team) return;
    setEditName(team.name || "");
    setEditTag(team.tag || "");
    setProfileOpen(true);
  };

  const saveProfile = async () => {
    if (!id) return;
    setSavingProfile(true);
    try {
      const updated = await api.updateTeam(id, { name: editName.trim() || undefined, tag: editTag });
      setTeam(updated);
      setProfileOpen(false);
      toast.success("Team profile updated");
    } catch (e: any) {
      toast.error(e?.message || "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const toggleCaptain = async (memberId: string) => {
    if (!team) return;
    try {
      const enable = !(team.captainIds?.includes(memberId));
      const updated = await api.setTeamCaptain(team.id, memberId, enable);
      setTeam(updated);
      toast.success(enable ? "Captain assigned" : "Captain removed");
    } catch (e: any) {
      toast.error(e?.message || "Failed to update captain");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Header */}
      <div className="relative h-[250px] w-full overflow-hidden mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-900/20 to-background z-10"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 z-0"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow"></div>

        <div className="container mx-auto px-4 h-full relative z-20 flex flex-col justify-center">
          <AnimatedSection>
            <Button variant="ghost" onClick={() => router.back()} className="mb-4 w-fit hover:bg-white/5 -ml-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Teams
            </Button>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 backdrop-blur border border-primary/20 flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight text-foreground drop-shadow-lg flex items-center gap-3">
                  {team.name}
                  {team.tag && (
                    <Badge variant="outline" className="text-lg border-primary/30 bg-primary/10 px-3 py-1">
                      {team.tag}
                    </Badge>
                  )}
                </h1>
                <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {team.members?.length || 0} Members
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Created {team.createdAt ? new Date(team.createdAt).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8 relative z-30">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatedSection delay={100}>
              <Card className="border-primary/10 bg-card/40 backdrop-blur">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" />
                        Team Stats
                      </CardTitle>
                    </div>
                    {(isManager || isCaptain) && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        <Shield className="w-3 h-3 mr-1" />
                        {isManager ? "Manager Access" : "Captain Access"}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    {team.gamesPlayed !== undefined && (
                      <div className="p-6 bg-background/40 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                        <p className="text-sm text-muted-foreground mb-1">Games Played</p>
                        <p className="text-4xl font-black">{team.gamesPlayed}</p>
                      </div>
                    )}
                    {team.balance !== undefined && (
                      <div className="p-6 bg-background/40 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                        <p className="text-sm text-muted-foreground mb-1">Team Balance</p>
                        <p className="text-4xl font-black text-green-400">{formatCurrency(team.balance || 0)}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <Card className="border-primary/10 bg-card/40 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Roster
                  </CardTitle>
                  <CardDescription>Active team members and roles</CardDescription>
                </CardHeader>
                <CardContent>
                  {team.members && team.members.length > 0 ? (
                    <div className="grid gap-3">
                      {team.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-4 bg-background/40 rounded-xl border border-white/5 hover:border-primary/20 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                              {member.email ? member.email.charAt(0).toUpperCase() : "?"}
                            </div>
                            <div>
                              <p className="font-medium">{member.email || "(no email)"}</p>
                              <div className="flex gap-2 mt-0.5">
                                <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-white/5 border-white/10 capitalize">
                                  {member.role}
                                </Badge>
                                {team.captainIds?.includes(member.id) && (
                                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                                    Captain
                                  </Badge>
                                )}
                                {member.id === team.managerId && (
                                  <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-primary/10 text-primary border-primary/20">
                                    Manager
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isManager && member.id !== team.managerId && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 text-xs hover:bg-white/5"
                                  onClick={() => toggleCaptain(member.id)}
                                >
                                  {team.captainIds?.includes(member.id) ? "Demote" : "Promote"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => {
                                    setRemoveTargetId(member.id)
                                    setRemoveReason("")
                                    setShowRemoveDialog(true)
                                  }}
                                >
                                  Remove
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-background/30 rounded-xl border border-dashed border-white/10">
                      <Users className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
                      <p className="text-muted-foreground">No members yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Dialog open={showRemoveDialog} onOpenChange={(o) => { if (!o && !removingMember) { setShowRemoveDialog(false); setRemoveTargetId(null); setRemoveReason(""); } }}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Remove Team Member</DialogTitle>
                  <DialogDescription>
                    Optionally provide a message. The member will receive a notification.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-2">
                  <Label htmlFor="remove-reason-team" className="text-sm">Message (optional)</Label>
                  <Input
                    id="remove-reason-team"
                    value={removeReason}
                    placeholder="e.g. Roster change for next split"
                    onChange={(e) => setRemoveReason(e.target.value)}
                  />
                </div>
                <DialogFooter className="flex justify-end gap-2">
                  <Button variant="outline" disabled={removingMember} onClick={() => { if (!removingMember) { setShowRemoveDialog(false); setRemoveTargetId(null); setRemoveReason(""); } }}>Cancel</Button>
                  <Button
                    variant="destructive"
                    disabled={removingMember || !removeTargetId}
                    onClick={async () => {
                      if (!removeTargetId || !team) return;
                      setRemovingMember(true)
                      try {
                        await api.removeTeamMember(team.id, removeTargetId, removeReason.trim() || undefined)
                        const updated = await api.getTeam(team.id)
                        setTeam(updated)
                        toast.success("Member removed")
                        setShowRemoveDialog(false)
                        setRemoveTargetId(null)
                        setRemoveReason("")
                      } catch (e: any) {
                        toast.error(e?.message || "Failed to remove member")
                      } finally {
                        setRemovingMember(false)
                      }
                    }}
                  >
                    {removingMember ? "Removing..." : "Remove Member"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {(isManager || isCaptain) && (
              <AnimatedSection delay={300}>
                <Card className="border-primary/10 bg-card/40 backdrop-blur">
                  <CardHeader>
                    <CardTitle>Team Management</CardTitle>
                    <CardDescription>Quick actions for your team</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full shadow-lg shadow-primary/10" variant="default" onClick={openProfileEditor}>
                      Manage Team Profile
                    </Button>
                    <Button className="w-full border-white/10 hover:bg-white/5" variant="outline" asChild>
                      <a href="/tournaments">Schedule/Join Tournaments</a>
                    </Button>
                  </CardContent>
                </Card>
              </AnimatedSection>
            )}

            <AnimatedSection delay={400}>
              <Card className="border-primary/10 bg-card/40 backdrop-blur">
                <CardHeader>
                  <CardTitle>Join Team</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user ? (
                    isManager ? (
                      <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 text-center">
                        <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
                        <p className="text-sm font-medium text-primary">You manage this team</p>
                      </div>
                    ) : user.teamId === team.id ? (
                      <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20 text-center">
                        <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-green-500">You are a member</p>
                      </div>
                    ) : user.teamId && user.teamId !== team.id ? (
                      <div className="p-4 bg-muted/30 rounded-xl border border-white/5 text-center">
                        <p className="text-sm text-muted-foreground">
                          You are already a member of another team
                        </p>
                      </div>
                    ) : myPending ? (
                      <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20 text-center">
                        <Clock className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-yellow-500">
                          Request pending approval
                        </p>
                      </div>
                    ) : isPlayer ? (
                      <Button
                        onClick={handleRequestToJoin}
                        disabled={requesting}
                        className="w-full shadow-lg shadow-primary/20"
                        size="lg"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        {requesting ? "Sending..." : "Request to Join"}
                      </Button>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center">
                        Only players can join teams
                      </p>
                    )
                  ) : (
                    <div className="space-y-3 text-center p-4 bg-muted/30 rounded-xl border border-white/5">
                      <p className="text-sm text-muted-foreground">
                        Sign in to request to join this team
                      </p>
                      <Button asChild className="w-full" size="lg">
                        <a href="/login">Sign In</a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </AnimatedSection>

            {isManager && (
              <AnimatedSection delay={500}>
                <Card className="border-primary/10 bg-card/40 backdrop-blur">
                  <CardHeader>
                    <CardTitle>Pending Requests</CardTitle>
                    <CardDescription>
                      Approve or decline player join requests
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    {loadingRequests ? (
                      <p className="text-muted-foreground text-center py-4">Loading...</p>
                    ) : pendingRequests.length === 0 ? (
                      <div className="text-center py-8 bg-background/30 rounded-xl border border-dashed border-white/10">
                        <p className="text-muted-foreground">No pending requests</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {pendingRequests.map((r) => (
                          <div
                            key={r.id}
                            className="flex items-center justify-between rounded-xl border border-white/5 bg-background/40 p-3"
                          >
                            <div className="min-w-0">
                              <p className="font-medium truncate">
                                {r.user?.email || r.userId}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(r.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 border-green-500/20 hover:bg-green-500/10 hover:text-green-500"
                                onClick={() => approve(r.id)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 border-red-500/20 hover:bg-red-500/10 hover:text-red-500"
                                onClick={() => decline(r.id)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={refreshRequests}
                      className="w-full text-xs text-muted-foreground hover:text-foreground"
                    >
                      Refresh Requests
                    </Button>
                  </CardContent>
                </Card>
              </AnimatedSection>
            )}

            {/* Profile Editor Dialog (inline at bottom to avoid layout issues) */}
            {profileOpen && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="w-full max-w-md rounded-xl bg-card border border-white/10 shadow-2xl">
                  <div className="p-6 border-b border-white/10">
                    <h3 className="text-xl font-bold">Edit Team Profile</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="team-name">Team Name</Label>
                      <Input 
                        id="team-name" 
                        value={editName} 
                        onChange={(e) => setEditName(e.target.value)} 
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="team-tag">Tag</Label>
                      <Input 
                        id="team-tag" 
                        value={editTag} 
                        onChange={(e) => setEditTag(e.target.value)} 
                        placeholder="e.g. RCD" 
                        className="bg-background/50"
                      />
                    </div>
                  </div>
                  <div className="p-6 flex justify-end gap-3 border-t border-white/10 bg-muted/20 rounded-b-xl">
                    <Button variant="outline" onClick={() => setProfileOpen(false)} className="border-white/10">Cancel</Button>
                    <Button onClick={saveProfile} disabled={savingProfile}>{savingProfile ? "Saving..." : "Save Changes"}</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
