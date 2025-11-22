"use client"

import { useEffect, useState } from "react"
import { api, type Tournament, type Team, type JoinRequest, type User } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { 
  Trophy, 
  Users, 
  Calendar, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  UserMinus, 
  Plus, 
  Shield, 
  Activity, 
  ArrowRight, 
  Swords, 
  Gamepad2, 
  Bell, 
  Settings, 
  LogOut,
  Search,
  Star,
  Zap
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import { AnimatedSection } from "@/components/ui/animated-section"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNotifications } from "@/lib/notifications-context"

function DashboardContent() {
  const { user, isPlayer, isTeamManager, isAdmin, refreshUser } = useAuth()
  const { notifications } = useNotifications()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [team, setTeam] = useState<Team | null>(null)
  const [managedTeams, setManagedTeams] = useState<Team[]>([])
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([])
  const [managerRequests, setManagerRequests] = useState<Array<JoinRequest & { team?: any; user?: any }>>([])
  const [loading, setLoading] = useState(true)
  
  // Team Creation State
  const [newTeamName, setNewTeamName] = useState("")
  const [newTeamTag, setNewTeamTag] = useState("")
  const [creatingTeam, setCreatingTeam] = useState(false)
  
  // Team Management State
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [removeTargetId, setRemoveTargetId] = useState<string | null>(null)
  const [removeReason, setRemoveReason] = useState("")
  const [removingMember, setRemovingMember] = useState(false)

  const isCaptain = !!(team && user && team.captainIds && team.captainIds.includes(user.id))

  // Fetch Data
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

        if (user && isTeamManager) {
          try {
            const all = await api.getTeams();
            setManagedTeams(all.filter(t => t.managerId === user.id));
            const reqs = await api.getManagerJoinRequests();
            setManagerRequests(reqs);
          } catch {
            setManagedTeams([]);
            setManagerRequests([]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user, isTeamManager])

  // Handlers
  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    setCreatingTeam(true);
    try {
      const created = await api.createTeam(newTeamName.trim(), newTeamTag.trim() || undefined);
      toast.success(`Team "${created.name}" created`);
      setNewTeamName("");
      setNewTeamTag("");
      await refreshUser();
      // Refresh managed teams
      const all = await api.getTeams();
      setManagedTeams(all.filter(t => t.managerId === (user?.id || created.managerId)));
    } catch (e: any) {
      toast.error(e?.message || "Failed to create team");
    } finally {
      setCreatingTeam(false);
    }
  }

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

  // Render Helpers
  const StatCard = ({ title, value, icon: Icon, trend, color = "primary" }: any) => (
    <Card className="relative overflow-hidden border-white/5 bg-card/40 backdrop-blur hover:bg-card/60 transition-all duration-300 group">
      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-${color}`}>
        <Icon className="w-16 h-16" />
      </div>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-2 rounded-lg bg-${color}/10 text-${color}`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">{value}</span>
          {trend && <span className="text-xs text-green-400 flex items-center"><TrendingUp className="w-3 h-3 mr-1" /> {trend}</span>}
        </div>
      </CardContent>
    </Card>
  )

  const QuickAction = ({ icon: Icon, label, href, onClick, variant = "outline" }: any) => {
    const content = (
      <div className="flex flex-col items-center justify-center gap-2 p-4 h-full hover:bg-primary/5 transition-colors rounded-xl cursor-pointer group">
        <div className="p-3 rounded-full bg-background border border-white/10 group-hover:border-primary/50 group-hover:scale-110 transition-all shadow-lg">
          <Icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
      </div>
    )
    
    if (href) return <Link href={href} className="block h-full">{content}</Link>
    return <div onClick={onClick} className="h-full">{content}</div>
  }

  return (
    <div className="min-h-screen bg-background pb-20 overflow-x-hidden">
      {/* Hero Header */}
      <div className="relative w-full bg-background border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background z-0"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] z-0"></div>
        
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-br from-primary to-purple-600 rounded-full blur opacity-50 animate-pulse"></div>
                <Avatar className="w-20 h-20 border-2 border-background relative z-10">
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback className="text-2xl bg-background text-primary font-bold">
                    {user?.username?.slice(0, 2).toUpperCase() || "US"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-4 border-background rounded-full z-20"></div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-3xl font-bold tracking-tight">
                    {user?.username || "Player"}
                  </h1>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 capitalize">
                    {user?.role?.replace("_", " ")}
                  </Badge>
                </div>
                <p className="text-muted-foreground flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Online • Ready to compete
                </p>
              </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <Button asChild className="flex-1 md:flex-none shadow-lg shadow-primary/20">
                <Link href="/tournaments">
                  <Swords className="w-4 h-4 mr-2" />
                  Find Match
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1 md:flex-none bg-background/50 backdrop-blur">
                <Link href="/profile">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
              </Button>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            <StatCard 
              title="Total Matches" 
              value={team?.gamesPlayed || 0} 
              icon={Gamepad2} 
              color="blue-500"
            />
            <StatCard 
              title="Win Rate" 
              value="--" 
              icon={TrendingUp} 
              color="green-500"
              trend="+2.5%"
            />
            <StatCard 
              title="Team Rank" 
              value="#42" 
              icon={Trophy} 
              color="yellow-500"
            />
            <StatCard 
              title="Earnings" 
              value={formatCurrency(team?.balance || 0)} 
              icon={Star} 
              color="purple-500"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-card/50 backdrop-blur border border-white/10 p-1 h-auto rounded-xl inline-flex w-full md:w-auto overflow-x-auto">
            <TabsTrigger value="overview" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Overview</TabsTrigger>
            <TabsTrigger value="tournaments" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">My Tournaments</TabsTrigger>
            <TabsTrigger value="team" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Team Center
              {managerRequests.length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-red-500 text-white hover:bg-red-600 h-5 px-1.5">{managerRequests.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Left Column - Main Feed */}
              <div className="md:col-span-2 space-y-6">
                {/* Featured / Next Up */}
                <AnimatedSection>
                  <Card className="border-primary/20 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-colors duration-500"></div>
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 animate-pulse">
                          <Zap className="w-3 h-3 mr-1" /> Live Now
                        </Badge>
                        <span className="text-xs text-muted-foreground">Ends in 2 days</span>
                      </div>
                      <CardTitle className="text-2xl md:text-3xl">Winter Championship 2025</CardTitle>
                      <CardDescription className="text-base">
                        The biggest tournament of the season is here. Prize pool $50,000.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" /> 32/64 Teams
                        </div>
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4" /> $50,000 Pool
                        </div>
                        <div className="flex items-center gap-2">
                          <Gamepad2 className="w-4 h-4" /> Valorant
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full md:w-auto shadow-lg shadow-primary/20">
                        Register Now <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardFooter>
                  </Card>
                </AnimatedSection>

                {/* Active Tournaments List */}
                <AnimatedSection delay={100}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-primary" /> Upcoming Tournaments
                    </h3>
                    <Link href="/tournaments" className="text-sm text-primary hover:underline">View All</Link>
                  </div>
                  <div className="grid gap-4">
                    {tournaments.length > 0 ? tournaments.map((t, i) => (
                      <Card key={t.id} className="group hover:border-primary/30 transition-all duration-300 bg-card/40 backdrop-blur">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                              <Trophy className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="font-semibold group-hover:text-primary transition-colors">{t.title}</h4>
                              <p className="text-xs text-muted-foreground flex items-center gap-2">
                                <span>{new Date(t.date).toLocaleDateString()}</span>
                                <span>•</span>
                                <span>{t.game || "General"}</span>
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" asChild>
                            <Link href={`/tournaments/${t.id}`}>Details</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    )) : (
                      <div className="text-center py-8 text-muted-foreground">No upcoming tournaments found.</div>
                    )}
                  </div>
                </AnimatedSection>
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions Grid */}
                <AnimatedSection delay={200}>
                  <Card className="bg-card/40 backdrop-blur border-white/5">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-3">
                      <QuickAction icon={Search} label="Find Team" href="/teams" />
                      <QuickAction icon={Plus} label="Create Team" onClick={() => document.getElementById('create-team-trigger')?.click()} />
                      <QuickAction icon={Users} label="My Team" href={user?.teamId ? `/teams/${user.teamId}` : "/teams"} />
                      <QuickAction icon={Settings} label="Edit Profile" href="/profile" />
                    </CardContent>
                  </Card>
                </AnimatedSection>

                {/* Notifications / Activity Feed */}
                <AnimatedSection delay={300}>
                  <Card className="bg-card/40 backdrop-blur border-white/5 h-[400px] flex flex-col">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                        <span>Activity Feed</span>
                        <Bell className="w-4 h-4" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden p-0">
                      <ScrollArea className="h-full px-6 pb-4">
                        <div className="space-y-4">
                          {notifications.length > 0 ? notifications.map((n) => (
                            <div key={n.id} className="flex gap-3 items-start pb-3 border-b border-white/5 last:border-0">
                              <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${n.type === 'success' ? 'bg-green-500' : n.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                              <div>
                                <p className="text-sm leading-snug">{n.message}</p>
                                <p className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                              </div>
                            </div>
                          )) : (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                              No recent activity.
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              </div>
            </div>
          </TabsContent>

          {/* TEAM CENTER TAB */}
          <TabsContent value="team" className="space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Team Management Logic from original file, restyled */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Left Col: Team List / Creation */}
              <div className="space-y-6">
                <Card className="bg-card/40 backdrop-blur border-white/5">
                  <CardHeader>
                    <CardTitle>Your Teams</CardTitle>
                    <CardDescription>Teams you manage or belong to</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {managedTeams.map(t => (
                      <div key={t.id} className="p-4 rounded-xl bg-background/50 border border-white/5 hover:border-primary/30 transition-all cursor-pointer group">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold group-hover:text-primary transition-colors">{t.name}</h4>
                          <Badge variant="outline">{t.tag || "N/A"}</Badge>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{t.members?.length || 0} Members</span>
                          <span className="text-green-400">{formatCurrency(t.balance || 0)}</span>
                        </div>
                        <Button size="sm" variant="secondary" className="w-full mt-3" asChild>
                          <Link href={`/teams/${t.id}`}>Manage</Link>
                        </Button>
                      </div>
                    ))}
                    
                    {/* Create Team Widget */}
                    <div className="p-4 rounded-xl border-2 border-dashed border-white/10 hover:border-primary/30 transition-all">
                      <h4 className="font-medium mb-3 text-center">Create New Team</h4>
                      <div className="space-y-3">
                        <Input 
                          placeholder="Team Name" 
                          value={newTeamName}
                          onChange={(e) => setNewTeamName(e.target.value)}
                          className="bg-background/50"
                        />
                        <Input 
                          placeholder="Tag (e.g. TSM)" 
                          value={newTeamTag}
                          onChange={(e) => setNewTeamTag(e.target.value)}
                          className="bg-background/50"
                        />
                        <Button 
                          id="create-team-trigger"
                          className="w-full" 
                          disabled={!newTeamName.trim() || creatingTeam}
                          onClick={handleCreateTeam}
                        >
                          {creatingTeam ? "Creating..." : "Create Team"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Col: Requests & Roster */}
              <div className="md:col-span-2 space-y-6">
                {/* Join Requests */}
                {managerRequests.length > 0 && (
                  <Card className="bg-card/40 backdrop-blur border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" /> Pending Requests
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3">
                        {managerRequests.map((r) => (
                          <div key={r.id} className="flex items-center justify-between p-4 rounded-xl bg-background/40 border border-white/5">
                            <div className="flex items-center gap-4">
                              <Avatar>
                                <AvatarFallback>{r.user?.email?.[0].toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{r.user?.email}</p>
                                <p className="text-xs text-muted-foreground">Wants to join <span className="text-primary font-bold">{r.team?.name}</span></p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={async () => { await api.approveJoinRequest(r.teamId, r.id); setManagerRequests(prev => prev.filter(x => x.id !== r.id)); }}>
                                Accept
                              </Button>
                              <Button size="sm" variant="destructive" onClick={async () => { await api.declineJoinRequest(r.teamId, r.id); setManagerRequests(prev => prev.filter(x => x.id !== r.id)); }}>
                                Decline
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Current Team Roster (if player has a team) */}
                {team && (
                  <Card className="bg-card/40 backdrop-blur border-white/5">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>{team.name} Roster</CardTitle>
                        <CardDescription>Manage members and roles</CardDescription>
                      </div>
                      <Button variant="outline" asChild>
                        <Link href={`/teams/${team.id}`}>View Full Page</Link>
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {team.members?.map((member) => (
                          <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-background/30 hover:bg-background/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={member.avatarUrl} />
                                <AvatarFallback>{member.email[0].toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{member.username || member.email}</p>
                                <div className="flex gap-2">
                                  <Badge variant="secondary" className="text-[10px] h-4 px-1">{member.role}</Badge>
                                  {team.captainIds?.includes(member.id) && <Badge className="text-[10px] h-4 px-1 bg-yellow-500/20 text-yellow-500">Captain</Badge>}
                                </div>
                              </div>
                            </div>
                            {isTeamManager && member.id !== team.managerId && (
                              <div className="flex gap-1">
                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openRemoveDialog(member.id)}>
                                  <UserMinus className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* TOURNAMENTS TAB */}
          <TabsContent value="tournaments" className="space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <Card className="bg-card/40 backdrop-blur border-white/5">
                <CardHeader>
                  <CardTitle>Tournament History</CardTitle>
                  <CardDescription>Your past and present competitions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>You haven't joined any tournaments yet.</p>
                    <Button variant="link" asChild className="mt-2">
                      <Link href="/tournaments">Browse Available Tournaments</Link>
                    </Button>
                  </div>
                </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <Dialog open={showRemoveDialog} onOpenChange={(o) => { if (!o) closeRemoveDialog() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
            <DialogDescription>
              Are you sure? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label>Reason (Optional)</Label>
            <Input 
              value={removeReason} 
              onChange={(e) => setRemoveReason(e.target.value)}
              placeholder="Why are you removing this member?"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={closeRemoveDialog}>Cancel</Button>
            <Button variant="destructive" onClick={confirmRemoveMember} disabled={removingMember}>
              {removingMember ? "Removing..." : "Remove Member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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