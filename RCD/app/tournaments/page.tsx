"use client"

import { useEffect, useState } from "react"
import { api, type Tournament } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AnimatedSection } from "@/components/ui/animated-section"
import Link from "next/link"
import { Trophy, Calendar, Users, Search, Plus, Filter, Gamepad2, Swords } from "lucide-react"
import { toast } from "sonner"

export default function TournamentsPage() {
  const { user, isAdmin } = useAuth()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [filteredTournaments, setFilteredTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const data = await api.getTournaments()
        setTournaments(data)
        setFilteredTournaments(data)
      } catch (error) {
        toast.error("Failed to load tournaments")
      } finally {
        setLoading(false)
      }
    }

    fetchTournaments()
  }, [])

  useEffect(() => {
    let filtered = tournaments

    if (searchQuery) {
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((t) => t.status === statusFilter)
    }

    setFilteredTournaments(filtered)
  }, [searchQuery, statusFilter, tournaments])

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-end justify-between gap-6">
            <AnimatedSection>
              <Badge variant="outline" className="mb-4 bg-primary/10 text-primary border-primary/20">
                <Trophy className="w-3 h-3 mr-1" />
                Competitive Play
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
                Active <span className="text-primary">Tournaments</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Join the most prestigious esports events. Compete for glory, prizes, and recognition.
              </p>
            </AnimatedSection>
            
            {isAdmin && (
              <AnimatedSection delay={100}>
                <Button asChild size="lg" className="shadow-lg shadow-primary/20">
                  <Link href="/admin?tab=tournaments">
                    <Plus className="w-5 h-5 mr-2" />
                    Create Tournament
                  </Link>
                </Button>
              </AnimatedSection>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20">
        {/* Filters Toolbar */}
        <AnimatedSection delay={200} className="sticky top-20 z-30 bg-background/80 backdrop-blur-xl border border-white/10 rounded-xl p-4 mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tournaments by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/50 border-transparent focus:bg-background transition-colors"
              />
            </div>
            <div className="flex items-center gap-2 min-w-[200px]">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full bg-muted/50 border-transparent focus:bg-background">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </AnimatedSection>

        {/* Tournament Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse bg-card/50 border-primary/10">
                <CardHeader>
                  <div className="h-6 bg-muted/50 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-muted/50 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-32 bg-muted/50 rounded-xl"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredTournaments.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map((tournament, index) => (
              <AnimatedSection key={tournament.id} delay={index * 50}>
                <Card
                  className="group h-full border-primary/10 bg-card/40 backdrop-blur-sm hover:bg-card/60 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 overflow-hidden relative"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <Badge
                        variant={
                          tournament.status === "upcoming"
                            ? "default"
                            : tournament.status === "ongoing"
                              ? "secondary"
                              : "outline"
                        }
                        className="uppercase tracking-wider font-bold"
                      >
                        {tournament.status}
                      </Badge>
                      {tournament.game && (
                        <div className="p-2 rounded-lg bg-muted/50 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                          <Gamepad2 className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-xl line-clamp-1 group-hover:text-primary transition-colors">{tournament.title}</CardTitle>
                    <CardDescription className="line-clamp-2 mt-2">{tournament.description || "No description available."}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background/40 p-2 rounded-md">
                        <Calendar className="w-4 h-4 text-primary/70" />
                        {new Date(tournament.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background/40 p-2 rounded-md">
                        <Users className="w-4 h-4 text-primary/70" />
                        {tournament.currentParticipants || 0} / {tournament.maxParticipants || "?"}
                      </div>
                    </div>
                    
                    {tournament.prizePool && (
                      <div className="flex items-center justify-center gap-2 py-2 px-4 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg border border-primary/10">
                        <Trophy className="w-4 h-4 text-primary" />
                        <span className="font-bold text-primary">{tournament.prizePool}</span>
                      </div>
                    )}

                    <Button asChild className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all" variant="secondary">
                      <Link href={`/tournaments/${tournament.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        ) : (
          <AnimatedSection>
            <Card className="p-16 text-center border-dashed border-2 border-muted bg-card/30">
              <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Swords className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No tournaments found</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                We couldn't find any tournaments matching your criteria. Try adjusting your filters or check back later.
              </p>
              <Button 
                variant="outline" 
                className="mt-6"
                onClick={() => {
                  setSearchQuery("")
                  setStatusFilter("all")
                }}
              >
                Clear Filters
              </Button>
            </Card>
          </AnimatedSection>
        )}
      </div>
    </div>
  )
}
