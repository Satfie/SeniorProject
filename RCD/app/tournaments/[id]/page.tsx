"use client"

import { useEffect, useState } from "react"
import { api, type Tournament, type Bracket } from "@/lib/api";
import { BracketViewer } from "@/components/bracket-viewer";
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useParams, useRouter } from "next/navigation"
import { Trophy, Calendar, Users, ArrowLeft, DollarSign, Gamepad2, Award, Share2, Clock, Shield, AlertCircle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import { AnimatedSection } from "@/components/ui/animated-section"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function TournamentDetailPage() {
  const rawParams = useParams();
  const id = (rawParams as any)?.id as string | undefined;
  const router = useRouter()
  const { user, isTeamManager, isPlayer } = useAuth()
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [showRegisterDialog, setShowRegisterDialog] = useState(false)
  const [selectedTeamId, setSelectedTeamId] = useState<string>("")
  const [bracket, setBracket] = useState<Bracket | null>(null);
  const [starting, setStarting] = useState(false);
  const [format, setFormat] = useState<"single" | "double">("single");
  const [managerTeams, setManagerTeams] = useState<Array<{id:string; name:string}>>([]);
  const [ending, setEnding] = useState(false);
  const [teamNames, setTeamNames] = useState<Record<string, string>>({});
  const [isCaptain, setIsCaptain] = useState(false);

  // Load teams for team manager picker
  useEffect(() => {
    if (user && isTeamManager) {
      api.getTeams().then(all => {
        const owned = all.filter(t => t.managerId === user.id).map(t => ({ id: t.id, name: t.name }));
        setManagerTeams(owned);
      }).catch(() => {});
    }
  }, [user, isTeamManager]);

  // Load all teams for mapping payout summary
  useEffect(() => {
    api.getTeams().then(all => {
      const map: Record<string,string> = {};
      all.forEach(t => { map[t.id] = t.name; });
      setTeamNames(map);
    }).catch(() => {});
  }, []);

  // Determine if current user is a captain of their team
  useEffect(() => {
    if (!user?.teamId) { setIsCaptain(false); return; }
    api.getTeam(user.teamId).then(t => {
      setIsCaptain(!!(t.captainIds && user && t.captainIds.includes(user.id)));
    }).catch(() => setIsCaptain(false));
  }, [user]);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        if (!id) return;
        const data = await api.getTournament(id);
        setTournament(data);
        // attempt to fetch bracket if ongoing or after generation
        try {
          const b = await api.getBracket(id);
          setBracket(b);
        } catch {
          setBracket(null);
        }
      } catch (error) {
        toast.error("Failed to load tournament");
        router.push("/tournaments");
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [id, router]);

  const handleRegister = async () => {
    if (!user) {
      router.push("/login")
      return
    }

    if (isTeamManager && !selectedTeamId) {
      toast.error("Please select a team")
      return
    }

    setRegistering(true)
    try {
  if (!id) return;
  await api.registerForTournament(
    id,
    isTeamManager ? selectedTeamId : (isCaptain && user.teamId ? user.teamId : undefined)
  );
      toast.success("Successfully registered for tournament!")
      setShowRegisterDialog(false)
    } catch (error: any) {
      toast.error(error.message || "Failed to register")
    } finally {
      setRegistering(false)
    }
  }

  const handleStart = async () => {
    if (!id) return;
    setStarting(true);
    try {
      const b = await api.startTournament(id, format);
      setBracket(b);
      toast.success(`Tournament started with ${b.kind} elimination`);
      // refresh tournament status
      const data = await api.getTournament(id);
      setTournament(data);
    } catch (e: any) {
      toast.error(e?.message || "Failed to start tournament");
    } finally {
      setStarting(false);
    }
  };

  const canEndTournament = (() => {
    if (!bracket) return false;
    if (bracket.kind === "single") {
      const rounds = bracket.rounds.winners;
      if (!rounds?.length) return false;
      const finalMatch = rounds[rounds.length - 1].matches.slice(-1)[0];
      return !!finalMatch && finalMatch.status === "completed";
    } else {
      const gm = bracket.rounds.grand?.[0]?.matches?.[0];
      return !!gm && gm.status === "completed";
    }
  })();

  const handleEnd = async () => {
    if (!id) return;
    setEnding(true);
    try {
      const payout = await api.endTournament(id);
      const summary = payout.awards
        .map((a) => `${teamNames[a.teamId] || a.teamId}: $${a.amount.toFixed(2)}`)
        .join("\n");
      toast.success(`Payout distributed ($${payout.total.toFixed(2)}):\n${summary}`);
      const data = await api.getTournament(id);
      setTournament(data);
    } catch (e: any) {
      toast.error(e?.message || "Failed to end tournament");
    } finally {
      setEnding(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-64 bg-muted/30 animate-pulse rounded-xl mb-8"></div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-96 bg-muted/30 animate-pulse rounded-xl"></div>
          </div>
          <div className="h-64 bg-muted/30 animate-pulse rounded-xl"></div>
        </div>
      </div>
    )
  }

  if (!tournament) {
    return null
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Banner */}
      <div className="relative h-[400px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background/80 to-background z-10"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 z-0"></div>
        {/* Abstract shapes */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-glow delay-700"></div>

        <div className="container mx-auto px-4 h-full relative z-20 flex flex-col justify-end pb-12">
          <AnimatedSection>
            <Button variant="ghost" onClick={() => router.back()} className="mb-6 text-muted-foreground hover:text-foreground pl-0 hover:bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tournaments
            </Button>
            
            <div className="flex flex-col md:flex-row items-end justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      tournament.status === "upcoming"
                        ? "default"
                        : tournament.status === "ongoing"
                        ? "secondary"
                        : "outline"
                    }
                    className="text-sm px-3 py-1 uppercase tracking-wider"
                  >
                    {tournament.status}
                  </Badge>
                  {tournament.game && (
                    <Badge variant="outline" className="bg-background/50 backdrop-blur border-primary/20">
                      <Gamepad2 className="w-3 h-3 mr-1" />
                      {tournament.game}
                    </Badge>
                  )}
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground drop-shadow-lg">
                  {tournament.title}
                </h1>
                <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    {new Date(tournament.date).toLocaleDateString("en-US", {
                      weekday: 'long',
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  {tournament.prizePool && (
                    <div className="flex items-center gap-2 text-primary font-semibold">
                      <Trophy className="w-4 h-4" />
                      {tournament.prizePool} Prize Pool
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" size="icon" className="rounded-full bg-background/50 backdrop-blur border-white/10">
                  <Share2 className="w-4 h-4" />
                </Button>
                {user ? (
                  <>
                    {tournament.status === "upcoming" ? (
                      (isTeamManager || isCaptain) ? (
                        <Button
                          onClick={() => setShowRegisterDialog(true)}
                          size="lg"
                          className="shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-105"
                        >
                          Register Team
                        </Button>
                      ) : (
                        <Button disabled variant="secondary" size="lg">
                          Registration Restricted
                        </Button>
                      )
                    ) : (
                      <Button disabled variant="secondary" size="lg">
                        {tournament.status === "ongoing" ? "Tournament in Progress" : "Tournament Ended"}
                      </Button>
                    )}
                  </>
                ) : (
                  <Button asChild size="lg" className="shadow-lg shadow-primary/20">
                    <Link href="/login">Sign In to Register</Link>
                  </Button>
                )}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8 relative z-30">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="bg-card/50 backdrop-blur border border-white/10 p-1 h-auto rounded-xl inline-flex">
            <TabsTrigger value="overview" className="px-6 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Overview</TabsTrigger>
            <TabsTrigger value="bracket" className="px-6 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Bracket</TabsTrigger>
            <TabsTrigger value="teams" className="px-6 py-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Teams</TabsTrigger>
            {user?.role === "admin" && (
              <TabsTrigger value="admin" className="px-6 py-2 rounded-lg data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground">Admin</TabsTrigger>
            )}
          </TabsList>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <TabsContent value="overview" className="space-y-6 mt-0">
                <AnimatedSection delay={100}>
                  <Card className="border-primary/10 bg-card/40 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        About Tournament
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <p className="text-lg leading-relaxed text-muted-foreground">
                        {tournament.description || "No description available for this tournament."}
                      </p>
                      
                      <div className="grid sm:grid-cols-2 gap-4 pt-4">
                        <div className="p-4 rounded-xl bg-background/50 border border-white/5 space-y-1">
                          <p className="text-sm text-muted-foreground">Format</p>
                          <p className="font-semibold text-lg capitalize">{tournament.type}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-background/50 border border-white/5 space-y-1">
                          <p className="text-sm text-muted-foreground">Participants</p>
                          <p className="font-semibold text-lg">
                            {tournament.currentParticipants || 0} / {tournament.maxParticipants} Teams
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-background/50 border border-white/5 space-y-1">
                          <p className="text-sm text-muted-foreground">Start Time</p>
                          <p className="font-semibold text-lg">
                            {new Date(tournament.date).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-background/50 border border-white/5 space-y-1">
                          <p className="text-sm text-muted-foreground">Entry Fee</p>
                          <p className="font-semibold text-lg text-green-500">Free</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedSection>

                {tournament.payout && (
                  <AnimatedSection delay={200}>
                    <Card className="border-primary/10 bg-gradient-to-br from-card/40 to-primary/5 backdrop-blur overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Trophy className="w-32 h-32" />
                      </div>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                          <Award className="w-6 h-6 text-yellow-500" /> 
                          Tournament Results
                        </CardTitle>
                        <CardDescription>
                          Total Prize Pool Distributed: <span className="text-primary font-bold">{formatCurrency(tournament.payout.total)}</span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {tournament.payout.awards.map((a: { place: number; teamId: string; amount: number }, i) => (
                            <div key={`${a.place}-${a.teamId}`} className="flex items-center justify-between p-3 rounded-lg bg-background/60 border border-white/5">
                              <div className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                  a.place === 1 ? 'bg-yellow-500/20 text-yellow-500' :
                                  a.place === 2 ? 'bg-gray-400/20 text-gray-400' :
                                  a.place === 3 ? 'bg-orange-500/20 text-orange-500' :
                                  'bg-muted text-muted-foreground'
                                }`}>
                                  {a.place}
                                </div>
                                <span className="font-medium">{teamNames[a.teamId] || a.teamId}</span>
                              </div>
                              <span className="font-mono font-semibold text-green-500">{formatCurrency(a.amount)}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </AnimatedSection>
                )}
              </TabsContent>

              <TabsContent value="bracket" className="mt-0">
                <AnimatedSection>
                  <Card className="border-primary/10 bg-card/40 backdrop-blur min-h-[600px]">
                    <CardHeader>
                      <CardTitle>Tournament Bracket</CardTitle>
                      <CardDescription>
                        {bracket ? `${bracket.kind} elimination bracket` : "Bracket will be generated when the tournament starts."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="p-4 overflow-hidden">
                        <BracketViewer tournamentId={id!} initial={bracket} isAdmin={user?.role === "admin"} />
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              </TabsContent>

              <TabsContent value="teams" className="mt-0">
                <AnimatedSection>
                  <Card className="border-primary/10 bg-card/40 backdrop-blur">
                    <CardHeader>
                      <CardTitle>Participating Teams</CardTitle>
                      <CardDescription>
                        {tournament.currentParticipants || 0} teams registered
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {/* Placeholder for teams list - API doesn't provide list of teams directly in tournament object yet */}
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                          <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                          <p>Team list visualization coming soon.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedSection>
              </TabsContent>

              {user?.role === "admin" && (
                <TabsContent value="admin" className="mt-0">
                  <Card className="border-destructive/20 bg-destructive/5 backdrop-blur">
                    <CardHeader>
                      <CardTitle className="text-destructive">Admin Controls</CardTitle>
                      <CardDescription>
                        Manage tournament state. Be careful, these actions affect all participants.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="font-medium">Bracket Configuration</h3>
                        <div className="flex gap-4">
                          <Button
                            variant={format === "single" ? "default" : "outline"}
                            onClick={() => setFormat("single")}
                            className="flex-1"
                          >
                            Single Elimination
                          </Button>
                          <Button
                            variant={format === "double" ? "default" : "outline"}
                            onClick={() => setFormat("double")}
                            className="flex-1"
                          >
                            Double Elimination
                          </Button>
                        </div>
                      </div>
                      
                      <Separator className="bg-destructive/10" />
                      
                      <div className="space-y-4">
                        <h3 className="font-medium">Actions</h3>
                        <div className="grid gap-4">
                          <Button
                            onClick={handleStart}
                            disabled={starting || tournament.status !== "upcoming"}
                            className="w-full"
                          >
                            {starting ? "Starting..." : "Start Tournament & Generate Bracket"}
                          </Button>
                          
                          <Button
                            variant="destructive"
                            onClick={handleEnd}
                            disabled={!canEndTournament || ending || !!tournament.payout}
                            className="w-full"
                          >
                            {ending ? "Ending..." : tournament.payout ? "Payout Distributed" : "End Tournament & Distribute Prizes"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              <AnimatedSection delay={300}>
                <Card className="border-primary/10 bg-card/40 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-muted-foreground text-sm">Status</span>
                      <Badge variant={tournament.status === "upcoming" ? "default" : "secondary"}>{tournament.status}</Badge>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-muted-foreground text-sm">Game</span>
                      <span className="font-medium">{tournament.game || "TBA"}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-muted-foreground text-sm">Mode</span>
                      <span className="font-medium">5v5</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-muted-foreground text-sm">Platform</span>
                      <span className="font-medium">PC</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-muted-foreground text-sm">Region</span>
                      <span className="font-medium">Global</span>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>

              <AnimatedSection delay={400}>
                <Card className="border-primary/10 bg-card/40 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-lg">Need Help?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-3 text-sm text-muted-foreground">
                      <AlertCircle className="w-5 h-5 text-primary shrink-0" />
                      <p>Make sure to read the rules before joining. Check-in starts 30 minutes before the event.</p>
                    </div>
                    <Button variant="outline" className="w-full">View Rules</Button>
                    <Button variant="ghost" className="w-full">Contact Support</Button>
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>
          </div>
        </Tabs>
      </div>

      {/* Register Dialog */}
      <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register for Tournament</DialogTitle>
            <DialogDescription>
              {isTeamManager
                ? "Select which team you want to register for this tournament"
                : "Confirm your team registration for this tournament"}
            </DialogDescription>
          </DialogHeader>
          {(isTeamManager || isCaptain) && (
            <div className="py-4">
              {isTeamManager ? (
                <Select value={selectedTeamId} onValueChange={setSelectedTeamId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your team" />
                </SelectTrigger>
                <SelectContent>
                  {managerTeams.length === 0 && (
                    <SelectItem value="" disabled>No teams found</SelectItem>
                  )}
                  {managerTeams.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
                </Select>
              ) : (
                <div className="text-sm text-muted-foreground">
                  You will register your team automatically.
                </div>
              )}
              {isTeamManager && (
                <p className="text-xs text-muted-foreground mt-2">
                  Note: Team selection will be populated from your actual teams
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRegisterDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleRegister} disabled={registering}>
              {registering ? "Registering..." : "Confirm Registration"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
