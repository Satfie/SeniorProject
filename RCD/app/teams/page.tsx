"use client"

import { useEffect, useState, useMemo } from "react";
import { api, type Team } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Users, Search, Plus, Shield, Trophy, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { AnimatedSection } from "@/components/ui/animated-section"

export default function TeamsPage() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamTag, setNewTeamTag] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchTeams = async () => {
    try {
      const data = await api.getTeams();
      setTeams(data);
      setFilteredTeams(data);
    } catch (error) {
      toast.error("Failed to load teams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // Compute base list excluding player's own team (requirement: remove joined team from listing)
  const availableTeams = useMemo(() => {
    if (!user) return teams;
    if (user.teamId) return teams.filter((t) => t.id !== user.teamId);
    return teams;
  }, [teams, user]);

  useEffect(() => {
    if (searchQuery) {
      setFilteredTeams(
        availableTeams.filter(
          (t) =>
            t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.tag?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredTeams(availableTeams);
    }
  }, [searchQuery, availableTeams]);

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      toast.error("Team name is required");
      return;
    }

    setCreating(true);
    try {
      await api.createTeam(newTeamName, newTeamTag);
      toast.success("Team created successfully!");
      setShowCreateDialog(false);
      setNewTeamName("");
      setNewTeamTag("");
      fetchTeams();
    } catch (error: any) {
      toast.error(error.message || "Failed to create team");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <div className="relative h-[300px] w-full overflow-hidden mb-12">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-purple-900/10 to-background z-10"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 z-0"></div>
        
        {/* Animated background elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }}></div>

        <div className="container mx-auto px-4 h-full relative z-20 flex flex-col justify-center items-center text-center">
          <AnimatedSection>
            <Badge variant="outline" className="mb-4 bg-primary/10 border-primary/20 text-primary backdrop-blur-sm">
              Community
            </Badge>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-foreground drop-shadow-lg mb-4">
              Find Your <span className="text-primary">Squad</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl text-lg mx-auto">
              Browse active teams, join a roster, or create your own legacy.
            </p>
          </AnimatedSection>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8 relative z-30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          {/* Search */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search teams by name or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card/50 backdrop-blur border-white/10 focus:border-primary/50 transition-all"
            />
          </div>

          {user && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Team
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card/95 backdrop-blur border-white/10">
                <DialogHeader>
                  <DialogTitle>Create New Team</DialogTitle>
                  <DialogDescription>
                    Start your own team and recruit players to compete together
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="team-name">Team Name</Label>
                    <Input
                      id="team-name"
                      placeholder="Enter team name"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="team-tag">Team Tag (Optional)</Label>
                    <Input
                      id="team-tag"
                      placeholder="e.g., RCD"
                      value={newTeamTag}
                      onChange={(e) => setNewTeamTag(e.target.value)}
                      maxLength={5}
                      className="bg-background/50"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                    className="border-white/10 hover:bg-white/5"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTeam} disabled={creating}>
                    {creating ? "Creating..." : "Create Team"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Teams Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="bg-card/40 backdrop-blur border-white/5">
                <CardHeader>
                  <div className="h-6 bg-muted/20 rounded w-3/4 mb-2 animate-pulse"></div>
                  <div className="h-4 bg-muted/20 rounded w-1/2 animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-muted/20 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredTeams.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team, index) => (
              <AnimatedSection key={team.id} delay={index * 50}>
                <Card
                  className="group border-primary/10 bg-card/40 backdrop-blur hover:bg-card/60 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <CardTitle className="text-xl flex items-center gap-2 group-hover:text-primary transition-colors">
                          {team.name}
                          {team.tag && (
                            <Badge variant="outline" className="text-xs border-primary/20 bg-primary/5">
                              {team.tag}
                            </Badge>
                          )}
                        </CardTitle>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Shield className="w-4 h-4" />
                      </div>
                    </div>
                    <CardDescription>
                      {team.members?.length || 0} member
                      {team.members?.length !== 1 ? "s" : ""}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="p-2 rounded-lg bg-background/40 border border-white/5 flex flex-col items-center justify-center text-center">
                        <span className="text-muted-foreground text-xs mb-1">Games</span>
                        <span className="font-bold">{team.gamesPlayed || 0}</span>
                      </div>
                      <div className="p-2 rounded-lg bg-background/40 border border-white/5 flex flex-col items-center justify-center text-center">
                        <span className="text-muted-foreground text-xs mb-1">Win Rate</span>
                        <span className="font-bold text-green-400">
                          {team.gamesPlayed ? Math.round(((team.wins || 0) / team.gamesPlayed) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      asChild
                      className="w-full border-primary/20 hover:bg-primary hover:text-primary-foreground group-hover:border-primary/50 transition-all"
                      variant="outline"
                    >
                      <Link href={`/teams/${team.id}`}>
                        View Team <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        ) : (
          <AnimatedSection>
            <Card className="p-12 text-center bg-card/40 backdrop-blur border-dashed border-white/10">
              <div className="w-20 h-20 bg-muted/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-muted-foreground/40" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No teams found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                We couldn't find any teams matching your search. Try adjusting your filters or create a new team.
              </p>
              {user && (
                <Button onClick={() => setShowCreateDialog(true)} className="shadow-lg shadow-primary/20">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Team
                </Button>
              )}
            </Card>
          </AnimatedSection>
        )}
      </div>
    </div>
  );
}
