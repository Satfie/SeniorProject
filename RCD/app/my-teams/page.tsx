"use client"

import { useEffect, useMemo, useState } from "react"
import { api, type Team, type User } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import Link from "next/link"
import { Users, Shield, Crown, RefreshCcw, UserMinus, ArrowRight, LayoutGrid } from "lucide-react"
import { AnimatedSection } from "@/components/ui/animated-section"

type MemberWithTeamRole = User & { teamRole?: "player" | "admin" }

export default function MyTeamsPage() {
  const { user } = useAuth()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

  const fetchTeams = async () => {
    setLoading(true)
    try {
      const data = await api.getTeams()
      setTeams(data)
    } catch (e) {
      toast.error("Failed to load teams")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeams()
  }, [])

  const myManagingTeams = useMemo(() => {
    if (!user) return [] as Team[]
    return teams.filter((t: Team) => t.managerId === user.id)
  }, [teams, user])

  const myMemberTeams = useMemo(() => {
    if (!user) return [] as Team[]
    return teams.filter(
      (t: Team) => t.managerId !== user.id && (t.members || []).some((m: User) => m.id === user.id),
    )
  }, [teams, user])

  const setLocalMemberRole = (teamId: string, memberId: string, role: MemberWithTeamRole["teamRole"]) => {
    setTeams((prev: Team[]) =>
      prev.map((t: Team) => {
        if (t.id !== teamId) return t
        const members = (t.members || []).map((m: User) =>
          m.id === memberId ? ({ ...m, role: role === "admin" ? "team_manager" : "player" } as User) : m,
        )
        return { ...t, members }
      }),
    )
  }

  const handleChangeRole = async (
    team: Team,
    member: User,
    newRole: "player" | "admin",
  ) => {
    // We interpret "admin" as team admin (team_manager) in the current global role model.
    const mappedRole: User["role"] = newRole === "admin" ? "team_manager" : "player"
    setUpdatingUserId(member.id)
    try {
      await api.changeUserRole(member.id, mappedRole)
      setLocalMemberRole(team.id, member.id, newRole)
      toast.success(`Updated ${member.email} to ${newRole}`)
    } catch (e: any) {
      toast.error(e?.message || "Failed to update role")
    } finally {
      setUpdatingUserId(null)
    }
  }

  const handleRemoveMember = async (team: Team, member: User) => {
    setUpdatingUserId(member.id)
    try {
      await api.removeTeamMember(team.id, member.id)
      setTeams((prev: Team[]) =>
        prev.map((t: Team) =>
          t.id === team.id ? { ...t, members: (t.members || []).filter((m: User) => m.id !== member.id) } : t,
        ),
      )
      toast.success("Member removed")
    } catch (e: any) {
      // Backend route may not exist yet; handle gracefully.
      toast.error(e?.message || "Remove member not available yet")
    } finally {
      setUpdatingUserId(null)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background pb-20">
        {/* Hero Header */}
        <div className="relative h-[300px] w-full overflow-hidden mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-primary/10 to-background z-10"></div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 z-0"></div>
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse-glow"></div>
          
          <div className="container mx-auto px-4 h-full relative z-20 flex flex-col justify-center">
            <AnimatedSection>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <Badge variant="outline" className="mb-4 border-blue-500/30 text-blue-400 bg-blue-500/10">
                    <LayoutGrid className="w-3 h-3 mr-2" />
                    Team Management
                  </Badge>
                  <h1 className="text-5xl font-black tracking-tight text-foreground drop-shadow-lg mb-4">
                    My Teams
                  </h1>
                  <p className="text-xl text-muted-foreground max-w-2xl">
                    Manage your rosters, assign roles, and track your team memberships all in one place.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button asChild variant="outline" className="border-white/10 hover:bg-white/5 backdrop-blur-sm">
                    <Link href="/teams">
                      <Users className="w-4 h-4 mr-2" /> Browse All
                    </Link>
                  </Button>
                  <Button onClick={fetchTeams} disabled={loading} className="shadow-lg shadow-primary/20">
                    <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> 
                    Refresh Data
                  </Button>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-8 relative z-30">
          {loading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <Card key={i} className="animate-pulse bg-card/30 border-white/5 h-64">
                  <CardHeader>
                    <div className="h-6 bg-white/5 rounded w-2/3 mb-2"></div>
                    <div className="h-4 bg-white/5 rounded w-1/3"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-24 bg-white/5 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-16">
              {/* Teams I manage */}
              <section>
                <AnimatedSection>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <Crown className="w-5 h-5 text-yellow-500" />
                      </div>
                      Teams I Manage
                    </h2>
                    <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                      {myManagingTeams.length} Active
                    </Badge>
                  </div>
                </AnimatedSection>

                {myManagingTeams.length === 0 ? (
                  <AnimatedSection delay={100}>
                    <Card className="p-12 text-center border-dashed border-2 border-white/10 bg-card/20">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">No Teams Managed</h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        You haven't created any teams yet. Start your own team to recruit members and join tournaments.
                      </p>
                      <Button asChild className="shadow-lg shadow-primary/20">
                        <Link href="/teams">Create a Team</Link>
                      </Button>
                    </Card>
                  </AnimatedSection>
                ) : (
                  <div className="grid gap-8">
                    {myManagingTeams.map((team: Team, idx) => (
                      <AnimatedSection key={team.id} delay={idx * 100}>
                        <Card className="border-primary/10 bg-card/40 backdrop-blur overflow-hidden group">
                          <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
                          <CardHeader className="bg-white/5 border-b border-white/5">
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-2xl flex items-center gap-3">
                                  {team.name}
                                  {team.tag && (
                                    <Badge variant="outline" className="text-xs font-normal border-white/20">
                                      [{team.tag}]
                                    </Badge>
                                  )}
                                </CardTitle>
                                <CardDescription className="mt-1">
                                  Managed by you • {(team.members?.length || 0)} member{team.members?.length !== 1 ? "s" : ""}
                                </CardDescription>
                              </div>
                              <Button asChild variant="ghost" size="sm" className="hover:bg-white/10">
                                <Link href={`/teams/${team.id}`}>
                                  View Public Page <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="p-6">
                            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Roster Management</h4>
                            {team.members && team.members.length > 0 ? (
                              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {(team.members as any[]).map((m: any, idx: number) => {
                                  const member: User = typeof m === 'string' ? ({ id: m } as unknown as User) : (m as User)
                                  const key = member.id || (member as any)._id || member.email || `member-${idx}`
                                  const isOwner = member.id === team.managerId
                                  
                                  return (
                                    <div
                                      key={String(key)}
                                      className={`flex flex-col gap-3 p-4 rounded-xl border transition-all ${
                                        isOwner 
                                          ? "bg-yellow-500/5 border-yellow-500/20" 
                                          : "bg-background/40 border-white/5 hover:border-white/10"
                                      }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                          isOwner ? "bg-yellow-500/20 text-yellow-500" : "bg-primary/10 text-primary"
                                        }`}>
                                          {isOwner ? <Crown className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                                        </div>
                                        <div className="overflow-hidden">
                                          <p className="font-medium truncate" title={member.email}>{member.email || 'Member'}</p>
                                          <p className="text-xs text-muted-foreground truncate">ID: {member.id || (member as any)._id || 'unknown'}</p>
                                        </div>
                                      </div>
                                      
                                      <div className="mt-auto pt-2 flex items-center gap-2">
                                        {isOwner ? (
                                          <Badge variant="outline" className="w-full justify-center py-1.5 border-yellow-500/30 text-yellow-500 bg-yellow-500/5">
                                            Team Owner
                                          </Badge>
                                        ) : (
                                          <>
                                            <Select
                                              disabled={updatingUserId === member.id}
                                              onValueChange={(val: string) =>
                                                handleChangeRole(team, member, val as "player" | "admin")
                                              }
                                              defaultValue={member.role === "team_manager" ? "admin" : "player"}
                                            >
                                              <SelectTrigger className="h-8 text-xs bg-background/50 border-white/10">
                                                <SelectValue placeholder="Role" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="player">Player</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                              </SelectContent>
                                            </Select>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleRemoveMember(team, member)}
                                              disabled={updatingUserId === member.id}
                                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                              <UserMinus className="w-4 h-4" />
                                            </Button>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            ) : (
                              <div className="text-center py-8 bg-background/30 rounded-xl border border-dashed border-white/10">
                                <p className="text-sm text-muted-foreground">No members in this team yet.</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </AnimatedSection>
                    ))}
                  </div>
                )}
              </section>

              {/* Teams I'm in */}
              <section>
                <AnimatedSection delay={200}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      Teams I'm In
                    </h2>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      {myMemberTeams.length} Active
                    </Badge>
                  </div>
                </AnimatedSection>

                {myMemberTeams.length === 0 ? (
                  <AnimatedSection delay={300}>
                    <Card className="p-12 text-center border-dashed border-2 border-white/10 bg-card/20">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Not a Member</h3>
                      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        You haven't joined any teams yet. Browse available teams and request to join.
                      </p>
                      <Button asChild variant="outline" className="border-primary/20 hover:bg-primary/10">
                        <Link href="/teams">Find Teams</Link>
                      </Button>
                    </Card>
                  </AnimatedSection>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myMemberTeams.map((team: Team, idx) => (
                      <AnimatedSection key={team.id} delay={idx * 100 + 300}>
                        <Card className="h-full border-primary/10 bg-card/40 backdrop-blur hover:bg-card/60 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 group">
                          <CardHeader>
                            <div className="flex items-start justify-between mb-2">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <Shield className="w-5 h-5" />
                              </div>
                              {team.tag && <Badge variant="outline" className="border-white/10">{team.tag}</Badge>}
                            </div>
                            <CardTitle className="text-xl group-hover:text-primary transition-colors">{team.name}</CardTitle>
                            <CardDescription>
                              {(team.members?.length || 0)} member{team.members?.length !== 1 ? "s" : ""}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <Button asChild variant="secondary" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                              <Link href={`/teams/${team.id}`}>
                                View Team Page <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                              </Link>
                            </Button>
                          </CardContent>
                        </Card>
                      </AnimatedSection>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
