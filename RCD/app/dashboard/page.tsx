"use client"

import { useEffect, useState } from "react"
import { api, type Tournament, type Team, type JoinRequest } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Trophy, Users, Calendar, TrendingUp, CheckCircle, XCircle, UserMinus, Plus, Shield, Activity, ArrowRight } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import { AnimatedSection } from "@/components/ui/animated-section"

function DashboardContent() {
  console.log("DashboardContent rendering")
  const { user, isPlayer, isTeamManager, isAdmin, refreshUser } = useAuth()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [team, setTeam] = useState<Team | null>(null)
  const [managedTeams, setManagedTeams] = useState<Team[]>([])
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([])
  const [managerRequests, setManagerRequests] = useState<Array<JoinRequest & { team?: any; user?: any }>>([])
  const [loading, setLoading] = useState(true)
  const [newTeamName, setNewTeamName] = useState("")
  const [newTeamTag, setNewTeamTag] = useState("")
  const [creatingTeam, setCreatingTeam] = useState(false)
  const isCaptain = !!(team && user && team.captainIds && team.captainIds.includes(user.id))

  // Removal dialog state
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [removeTargetId, setRemoveTargetId] = useState<string | null>(null)
  const [removeReason, setRemoveReason] = useState("")
  const [removingMember, setRemovingMember] = useState(false)

  const openRemoveDialog = (memberId: string) => {
    setRemoveTargetId(memberId)
    setRemoveReason("")
    setShowRemoveDialog(true)
  }
  const closeRemoveDialog = () => {
    if (removingMember) return
    setShowRemoveDialog(false)
    setRemoveTargetId(null)
    setRemoveReason("")
  }
  const confirmRemoveMember = async () => {
    if (!team || !removeTargetId) return
    setRemovingMember(true)
    try {
      await api.removeTeamMember(team.id, removeTargetId, removeReason.trim() || undefined)
      const updated = await api.getTeam(team.id)
      setTeam(updated)
      toast.success("Member removed")
      closeRemoveDialog()
    } catch (e: any) {
      toast.error(e?.message || "Failed to remove member")
    } finally {
      setRemovingMember(false)
    }
  }
  useEffect(() => {
    const fetchData = async () => {
      try {
        const tournamentsData = await api.getTournaments()
        setTournaments(tournamentsData.filter((t) => t.status === "upcoming").slice(0, 5))

        if (user?.teamId) {
          try {
            const teamData = await api.getTeam(user.teamId);
            setTeam(teamData);
          } catch {}
        } else {
          setTeam(null)
        }

        // Load teams managed by this user (even if different from their player team)
        if (user && isTeamManager) {
          try {
            const all = await api.getTeams();
            setManagedTeams(all.filter(t => t.managerId === user.id));
            // Load aggregated manager join requests
            const reqs = await api.getManagerJoinRequests();
            setManagerRequests(reqs);
          } catch {
            setManagedTeams([]);
            setManagerRequests([]);
          }
        } else {
          setManagedTeams([]);
          setManagerRequests([]);
        }
      } catch (error) {
        console.error("[v0] Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    setCreatingTeam(true);
    try {
      const created = await api.createTeam(newTeamName.trim(), newTeamTag.trim() || undefined);
      toast.success(`Team "${created.name}" created`);
      setNewTeamName("");
      setNewTeamTag("");
      // Refresh auth and managed teams so dashboard reflects new manager team
      await refreshUser();
      try {
        const all = await api.getTeams();
        setManagedTeams(all.filter(t => t.managerId === (user?.id || created.managerId)));
      } catch {}
    } catch (e: any) {
      toast.error(e?.message || "Failed to create team");
    } finally {
      setCreatingTeam(false);
    }
  }

  const handleApproveRequest = async (requestId: string) => {
    if (!team) return
    try {
      await api.approveJoinRequest(team.id, requestId)
      toast.success("Join request approved")
      setJoinRequests(joinRequests.filter((r) => r.id !== requestId))
    } catch (error: any) {
      toast.error(error.message || "Failed to approve request")
    }
  }

  const handleDeclineRequest = async (requestId: string) => {
    if (!team) return
    try {
      await api.declineJoinRequest(team.id, requestId)
      toast.success("Join request declined")
      setJoinRequests(joinRequests.filter((r) => r.id !== requestId))
    } catch (error: any) {
      toast.error(error.message || "Failed to decline request")
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Dashboard Header */}
      <div className="relative h-[250px] w-full overflow-hidden mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-900/20 to-background z-10"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 z-0"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow"></div>

        <div className="container mx-auto px-4 h-full relative z-20 flex flex-col justify-center">
          <AnimatedSection>
            <div className="flex items-center gap-4 mb-2">
              <div className="p-2 bg-primary/20 rounded-lg backdrop-blur border border-primary/20">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <Badge variant="outline" className="bg-background/50 backdrop-blur border-primary/20 capitalize px-3 py-1">
                {user?.role?.replace("_", " ")} Dashboard
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground drop-shadow-lg mb-2">
              Welcome back, <span className="text-primary">{user?.username || user?.email?.split('@')[0]}</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl text-lg">
              Manage your teams, track tournament progress, and dominate the competition.
            </p>
          </AnimatedSection>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-12 relative z-30">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <AnimatedSection delay={100}>
            <Card className="border-primary/10 bg-card/40 backdrop-blur hover:bg-card/60 transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">Upcoming Tournaments</CardTitle>
                <Trophy className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{tournaments.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Available to join now</p>
              </CardContent>
            </Card>
          </AnimatedSection>

          {(isTeamManager || isCaptain) && team && (
            <>
              <AnimatedSection delay={200}>
                <Card className="border-primary/10 bg-card/40 backdrop-blur hover:bg-card/60 transition-all duration-300 group">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">Team Members</CardTitle>
                    <Users className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{team.members?.length || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Active roster</p>
                  </CardContent>
                </Card>
              </AnimatedSection>

              <AnimatedSection delay={300}>
                <Card className="border-primary/10 bg-card/40 backdrop-blur hover:bg-card/60 transition-all duration-300 group">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">Games Played</CardTitle>
                    <TrendingUp className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{team.gamesPlayed || 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">Total matches completed</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            </>
          )}

          {isPlayer && (
            <AnimatedSection delay={200}>
              <Card className="border-primary/10 bg-card/40 backdrop-blur hover:bg-card/60 transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">Your Team</CardTitle>
                  <Shield className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{user?.teamId ? "Active" : "None"}</div>
                  <p className="text-xs text-muted-foreground mt-1">{user?.teamId ? "Ready to compete" : "Join a team to start"}</p>
                </CardContent>
              </Card>
            </AnimatedSection>
          )}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="tournaments" className="space-y-8">
          <TabsList className="bg-card/50 backdrop-blur border border-white/10 p-1 h-auto rounded-xl inline-flex">
            <TabsTrigger value="tournaments" className="px-6 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Tournaments</TabsTrigger>
            {isTeamManager && (
              <TabsTrigger value="team" className="px-6 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Team Management
                {managerRequests.length > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-white/20 text-white hover:bg-white/30">{managerRequests.length}</Badge>
                )}
              </TabsTrigger>
            )}
            {isPlayer && <TabsTrigger value="activity" className="px-6 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">My Activity</TabsTrigger>}
          </TabsList>

          <TabsContent value="tournaments" className="space-y-4 mt-0">
            <AnimatedSection>
              <Card className="border-primary/10 bg-card/40 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    Upcoming Tournaments
                  </CardTitle>
                  <CardDescription>Browse and register for upcoming competitions</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 bg-muted/30 rounded-xl animate-pulse"></div>
                      ))}
                    </div>
                  ) : tournaments.length > 0 ? (
                    <div className="grid gap-4">
                      {tournaments.map((tournament) => (
                        <div
                          key={tournament.id}
                          className="group flex flex-col md:flex-row items-center justify-between p-4 rounded-xl bg-background/40 border border-white/5 hover:border-primary/30 hover:bg-background/60 transition-all duration-300"
                        >
                          <div className="flex-1 w-full md:w-auto mb-4 md:mb-0">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{tournament.title}</h3>
                              <Badge variant="outline" className="text-xs border-primary/20 bg-primary/5">{tournament.game || "General"}</Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-primary/70" />
                                {new Date(tournament.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                              {tournament.prizePool && (
                                <span className="flex items-center gap-1.5 text-green-400">
                                  <Trophy className="w-3.5 h-3.5" />
                                  {tournament.prizePool}
                                </span>
                              )}
                              <span className="flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5" />
                                {tournament.currentParticipants || 0}/{tournament.maxParticipants} Teams
                              </span>
                            </div>
                          </div>
                          <Button asChild variant="outline" className="w-full md:w-auto border-primary/20 hover:bg-primary hover:text-primary-foreground group-hover:border-primary/50">
                            <Link href={`/tournaments/${tournament.id}`}>
                              View Details <ArrowRight className="w-4 h-4 ml-2" />
                            </Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-background/30 rounded-xl border border-dashed border-white/10">
                      <Trophy className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-1">No Tournaments Found</h3>
                      <p className="text-muted-foreground">Check back later for new competitions.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </AnimatedSection>
          </TabsContent>

            {(isTeamManager || isCaptain) && (
            <TabsContent value="team" className="space-y-6 mt-0">
              {/* Managed Teams List (manager only) */}
              {isTeamManager && (
                <AnimatedSection>
                  <Card className="border-primary/10 bg-card/40 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        Managed Teams
                      </CardTitle>
                      <CardDescription>Teams where you are the manager</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {managedTeams.length > 0 ? (
                        <div className="grid gap-4">
                          {managedTeams.map((mt) => (
                            <div key={mt.id} className="flex items-center justify-between p-4 rounded-xl bg-background/40 border border-white/5 hover:border-primary/30 transition-all">
                              <div>
                                <p className="font-bold text-lg">{mt.name}</p>
                                <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                                  <span>Members: {mt.members?.length || 0}</span>
                                  <span className="text-green-400">Balance: {formatCurrency(mt.balance || 0)}</span>
                                </div>
                              </div>
                              <Button asChild variant="outline" size="sm" className="border-white/10 hover:bg-primary hover:text-primary-foreground">
                                <Link href={`/teams/${mt.id}`}>Manage Team</Link>
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-8 px-6 bg-background/30 rounded-xl border border-dashed border-white/10 space-y-6">
                          <div className="text-center">
                            <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-muted-foreground">You don’t manage any teams yet.</p>
                          </div>
                          
                          <div className="max-w-md mx-auto p-6 bg-background/50 rounded-xl border border-white/5">
                            <h3 className="font-semibold mb-4 text-center">Create Your First Team</h3>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="new-team-name">Team Name</Label>
                                <Input
                                  id="new-team-name"
                                  placeholder="e.g. Night Hawks"
                                  value={newTeamName}
                                  onChange={(e) => setNewTeamName(e.target.value)}
                                  className="bg-background/50"
                                />
                              </div>
                              <div>
                                <Label htmlFor="new-team-tag">Tag (Optional)</Label>
                                <Input
                                  id="new-team-tag"
                                  placeholder="e.g. NH"
                                  value={newTeamTag}
                                  onChange={(e) => setNewTeamTag(e.target.value)}
                                  className="bg-background/50"
                                />
                              </div>
                              <Button className="w-full" disabled={!newTeamName.trim() || creatingTeam} onClick={handleCreateTeam}>
                                {creatingTeam ? (
                                  <>Creating...</>
                                ) : (
                                  <>
                                    <Plus className="w-4 h-4 mr-2" /> Create Team
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {managedTeams.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-white/5">
                          <h4 className="text-sm font-medium mb-4">Create Another Team</h4>
                          <div className="flex gap-3 items-end">
                            <div className="flex-1">
                              <Label htmlFor="new-team-name-2" className="sr-only">Team Name</Label>
                              <Input
                                id="new-team-name-2"
                                placeholder="New Team Name"
                                value={newTeamName}
                                onChange={(e) => setNewTeamName(e.target.value)}
                                className="bg-background/50"
                              />
                            </div>
                            <div className="w-24">
                              <Label htmlFor="new-team-tag-2" className="sr-only">Tag</Label>
                              <Input
                                id="new-team-tag-2"
                                placeholder="Tag"
                                value={newTeamTag}
                                onChange={(e) => setNewTeamTag(e.target.value)}
                                className="bg-background/50"
                              />
                            </div>
                            <Button disabled={!newTeamName.trim() || creatingTeam} onClick={handleCreateTeam}>
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </AnimatedSection>
              )}

              {/* Aggregated Join Requests (manager only) */}
              {isTeamManager && managerRequests.length > 0 && (
                <AnimatedSection delay={100}>
                  <Card className="border-primary/10 bg-card/40 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        Pending Join Requests
                      </CardTitle>
                      <CardDescription>Approve or decline incoming requests for all your teams</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3">
                        {managerRequests.map((r) => (
                          <div key={r.id} className="flex items-center justify-between p-4 rounded-xl bg-background/40 border border-white/5">
                            <div>
                              <p className="font-medium">{r.user?.email || r.userId}</p>
                              <p className="text-xs text-muted-foreground">Requesting to join: <span className="text-primary">{r.team?.name || r.teamId}</span></p>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="border-green-500/20 hover:bg-green-500/10 hover:text-green-500" onClick={async () => { await api.approveJoinRequest(r.teamId, r.id); setManagerRequests(prev => prev.filter(x => x.id !== r.id)); }}>
                                <CheckCircle className="w-4 h-4 mr-1" /> Approve
                              </Button>
                              <Button size="sm" variant="outline" className="border-red-500/20 hover:bg-red-500/10 hover:text-red-500" onClick={async () => { await api.declineJoinRequest(r.teamId, r.id); setManagerRequests(prev => prev.filter(x => x.id !== r.id)); }}>
                                <XCircle className="w-4 h-4 mr-1" /> Decline
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              )}

              {/* Player's own team controls (if they are also in a team) */}
              {team ? (
                <>
                  <AnimatedSection delay={200}>
                    <Card className="border-primary/10 bg-card/40 backdrop-blur">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-xl">{team.name}</CardTitle>
                            <CardDescription>Manage your team and members</CardDescription>
                          </div>
                          <Button asChild variant="outline" className="border-primary/20 hover:bg-primary hover:text-primary-foreground">
                            <Link href={`/teams/${team.id}`}>View Team Page</Link>
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-4 bg-background/40 rounded-xl border border-white/5">
                            <p className="text-sm text-muted-foreground mb-1">Team Balance</p>
                            <p className="text-2xl font-bold text-green-400">{formatCurrency(team.balance || 0)}</p>
                          </div>
                          <div className="p-4 bg-background/40 rounded-xl border border-white/5">
                            <p className="text-sm text-muted-foreground mb-1">Total Games</p>
                            <p className="text-2xl font-bold">{team.gamesPlayed || 0}</p>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-medium mb-4 flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary" /> Roster
                          </h3>
                          {team.members && team.members.length > 0 ? (
                            <div className="grid gap-2">
                              {team.members.map((member) => (
                                <div
                                  key={member.id}
                                  className="flex items-center justify-between p-3 rounded-lg bg-background/30 border border-white/5"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                      {member.email.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <p className="font-medium text-sm">{member.email}</p>
                                      <div className="flex gap-2">
                                        <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                                        {team.captainIds?.includes(member.id) && (
                                          <Badge variant="secondary" className="text-[10px] h-4 px-1 bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Captain</Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {isTeamManager && member.id !== team.managerId && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => openRemoveDialog(member.id)}
                                      >
                                        <UserMinus className="w-4 h-4" />
                                      </Button>
                                    )}
                                    {isTeamManager && member.id !== team.managerId && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-xs h-8"
                                        onClick={async () => {
                                          try {
                                            const enable = !(team.captainIds?.includes(member.id));
                                            const updated = await api.setTeamCaptain(team.id, member.id, enable);
                                            setTeam(updated);
                                            toast.success(enable ? "Captain assigned" : "Captain removed");
                                          } catch (e: any) {
                                            toast.error(e?.message || "Failed to update captain");
                                          }
                                        }}
                                      >
                                        {team.captainIds?.includes(member.id) ? "Demote" : "Promote"}
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                              No team members yet
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </AnimatedSection>

                  {/* Team Join Requests (manager only) */}
                  {isTeamManager && (
                    <AnimatedSection delay={300}>
                      <Card className="border-primary/10 bg-card/40 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="text-lg">Join Requests for {team.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {joinRequests.length > 0 ? (
                          <div className="space-y-3">
                            {joinRequests.map((request) => (
                              <div
                                key={request.id}
                                className="flex items-center justify-between p-4 rounded-xl bg-background/40 border border-white/5"
                              >
                                <div>
                                  <p className="font-medium">{request.user?.email || "Unknown User"}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Requested {new Date(request.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleApproveRequest(request.id)}
                                    className="border-green-500/20 hover:bg-green-500/10 hover:text-green-500"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeclineRequest(request.id)}
                                    className="border-red-500/20 hover:bg-red-500/10 hover:text-red-500"
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Decline
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-sm text-muted-foreground">
                            No pending join requests for this team
                          </div>
                        )}
                      </CardContent>
                      </Card>
                    </AnimatedSection>
                  )}
                  
                  {/* Removal dialog component */}
                  <Dialog open={showRemoveDialog} onOpenChange={(o) => { if (!o) closeRemoveDialog() }}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Remove Team Member</DialogTitle>
                        <DialogDescription>
                          Optionally provide a message. The member will receive a notification.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3 py-2">
                        <Label htmlFor="remove-reason" className="text-sm">Message (optional)</Label>
                        <Input
                          id="remove-reason"
                          value={removeReason}
                          placeholder="e.g. Adjusting roster for next tournament"
                          onChange={(e) => setRemoveReason(e.target.value)}
                        />
                      </div>
                      <DialogFooter className="flex justify-end gap-2">
                        <Button variant="outline" onClick={closeRemoveDialog} disabled={removingMember}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmRemoveMember} disabled={removingMember}>
                          {removingMember ? "Removing..." : "Remove Member"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              ) : (
                !isTeamManager && (
                  <AnimatedSection>
                    <Card className="border-primary/10 bg-card/40 backdrop-blur">
                      <CardContent className="py-16 text-center">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                          <Users className="w-10 h-10 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">No Team Yet</h3>
                        <p className="text-muted-foreground mb-8 max-w-md mx-auto">Create a team to start managing members and competing in tournaments.</p>
                        <Button asChild size="lg" className="shadow-lg shadow-primary/20">
                          <Link href="/teams">Browse Teams</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </AnimatedSection>
                )
              )}
            </TabsContent>
          )}

          {isPlayer && (
            <TabsContent value="activity" className="space-y-6 mt-0">
              <AnimatedSection>
                <Card className="border-primary/10 bg-card/40 backdrop-blur">
                  <CardHeader>
                    <CardTitle>My Tournaments</CardTitle>
                    <CardDescription>Tournaments you've registered for</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-16 bg-background/30 rounded-xl border border-dashed border-white/10">
                      <Trophy className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No tournaments joined yet</p>
                      <Button asChild variant="outline" className="border-primary/20 hover:bg-primary hover:text-primary-foreground">
                        <Link href="/tournaments">Browse Tournaments</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>

              <AnimatedSection delay={100}>
                  <Card className="border-primary/10 bg-card/40 backdrop-blur">
                    <CardHeader>
                      <CardTitle>My Team</CardTitle>
                      <CardDescription>Your current team affiliation</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {user?.teamId ? (
                        <div className="p-6 border border-white/10 rounded-xl bg-background/40 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-lg mb-1">Team ID: {user.teamId}</p>
                            <p className="text-sm text-muted-foreground">Member since {new Date().getFullYear()}</p>
                          </div>
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/teams/${user.teamId}`}>View Team</Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center py-16 bg-background/30 rounded-xl border border-dashed border-white/10">
                          <Users className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
                          <p className="text-muted-foreground mb-4">You're not part of a team yet</p>
                          <Button asChild variant="outline" className="border-primary/20 hover:bg-primary hover:text-primary-foreground">
                            <Link href="/teams">Browse Teams</Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </AnimatedSection>
              </TabsContent>
            )}
        </Tabs>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute requireAuth>
      <DashboardContent />
    </ProtectedRoute>
  )
}