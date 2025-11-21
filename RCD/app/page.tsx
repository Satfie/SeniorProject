"use client"

import { useEffect, useState } from "react"
import { api, type Tournament } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatedSection } from "@/components/ui/animated-section"
import Link from "next/link"
import { Trophy, Users, Calendar, ArrowRight, Zap, Shield, Gamepad2, Swords } from "lucide-react"
import { toast } from "sonner"

export default function HomePage() {
  const { user } = useAuth()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const data = await api.getTournaments()
        setTournaments(data.slice(0, 3))
      } catch (error) {
        toast.error("Failed to load tournaments")
      } finally {
        setLoading(false)
      }
    }

    fetchTournaments()
  }, [])

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background opacity-70"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl animate-float duration-[8s]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float duration-[10s] delay-1000"></div>

        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            <AnimatedSection delay={0}>
              <Badge className="mx-auto px-4 py-1.5 text-sm backdrop-blur-sm bg-primary/10 border-primary/20 text-primary hover:bg-primary/20 transition-colors" variant="outline">
                <Zap className="w-4 h-4 mr-2 fill-current" />
                The Next Gen Esports Platform
              </Badge>
            </AnimatedSection>
            
            <AnimatedSection delay={100}>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-balance leading-[1.1]">
                Compete in the{" "}
                <span className="relative inline-block">
                  <span className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500 blur-2xl opacity-30 animate-pulse-glow"></span>
                  <span className="relative bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient-xy bg-[length:200%_auto]">
                    Ultimate Arena
                  </span>
                </span>
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto text-pretty font-light">
                Join tournaments, build your dream team, and dominate the competition. 
                <span className="text-foreground font-medium"> Esport Shield</span> brings professional tournament management to everyone.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={300} className="flex flex-wrap items-center justify-center gap-6 pt-4">
              {user ? (
                <>
                  <Button asChild size="lg" className="text-lg h-14 px-8 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-105">
                    <Link href="/tournaments">
                      Browse Tournaments
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="text-lg h-14 px-8 rounded-full bg-background/50 backdrop-blur border-primary/20 hover:bg-primary/10 transition-all hover:scale-105">
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="lg" className="text-lg h-14 px-8 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-105">
                    <Link href="/register">
                      Start Competing
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="text-lg h-14 px-8 rounded-full bg-background/50 backdrop-blur border-primary/20 hover:bg-primary/10 transition-all hover:scale-105">
                    <Link href="/login">Sign In</Link>
                  </Button>
                </>
              )}
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent"></div>
        <div className="container mx-auto px-4 relative">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Why Choose Esport Shield?</h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">Everything you need to elevate your competitive gaming experience</p>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Trophy,
                title: "Professional Tournaments",
                desc: "Compete in organized tournaments with automated brackets, real-time schedules, and secure prize pools.",
                color: "text-yellow-500"
              },
              {
                icon: Users,
                title: "Team Management",
                desc: "Create and manage your team roster, recruit top talent, and track your team's performance history.",
                color: "text-blue-500"
              },
              {
                icon: Shield,
                title: "Secure Platform",
                desc: "Enterprise-grade security with role-based access control and verified player identities.",
                color: "text-green-500"
              }
            ].map((feature, i) => (
              <AnimatedSection key={i} delay={i * 100}>
                <Card className="h-full border-primary/10 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/5 group overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <CardHeader>
                    <div className={`w-16 h-16 rounded-2xl bg-background/80 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300 ${feature.color}`}>
                      <feature.icon className="w-8 h-8" />
                    </div>
                    <CardTitle className="text-2xl mb-2">{feature.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.desc}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tournaments */}
      <section className="py-32 bg-background relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent"></div>
        
        <div className="container mx-auto px-4 relative">
          <div className="flex items-end justify-between mb-12">
            <AnimatedSection>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Featured Tournaments</h2>
              <p className="text-muted-foreground text-lg">Join the competition and prove your skills</p>
            </AnimatedSection>
            <AnimatedSection delay={100}>
              <Button asChild variant="outline" className="hidden md:flex group">
                <Link href="/tournaments">
                  View All Tournaments
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </AnimatedSection>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse bg-card/30 border-primary/10 h-[300px]">
                  <CardHeader>
                    <div className="h-8 bg-muted/50 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-muted/50 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-32 bg-muted/50 rounded-xl"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : tournaments.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {tournaments.map((tournament, i) => (
                <AnimatedSection key={tournament.id} delay={i * 100}>
                  <Card
                    className="h-full border-primary/20 bg-card/40 backdrop-blur-sm hover:bg-card/60 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 group relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary transform -translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <CardHeader>
                      <div className="flex items-start justify-between mb-4">
                        <Badge variant={tournament.status === "upcoming" ? "default" : "secondary"} className="uppercase tracking-wider font-bold">
                          {tournament.status}
                        </Badge>
                        {tournament.game && (
                          <Badge variant="outline" className="border-primary/20">
                            <Gamepad2 className="w-3 h-3 mr-1" />
                            {tournament.game}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-2xl group-hover:text-primary transition-colors">{tournament.title}</CardTitle>
                      <CardDescription className="line-clamp-2 text-base mt-2">{tournament.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background/50 p-2 rounded-lg">
                          <Calendar className="w-4 h-4 text-primary" />
                          {new Date(tournament.date).toLocaleDateString()}
                        </div>
                        {tournament.prizePool && (
                          <div className="flex items-center gap-2 text-sm font-semibold text-primary bg-primary/10 p-2 rounded-lg">
                            <Trophy className="w-4 h-4" />
                            {tournament.prizePool}
                          </div>
                        )}
                      </div>
                      <Button asChild className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" variant="secondary">
                        <Link href={`/tournaments/${tournament.id}`}>
                          View Details
                          <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
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
                <h3 className="text-xl font-semibold mb-2">No Tournaments Active</h3>
                <p className="text-muted-foreground">Check back soon for upcoming competitions!</p>
              </Card>
            </AnimatedSection>
          )}
          
          <div className="mt-8 text-center md:hidden">
            <Button asChild variant="outline" className="w-full">
              <Link href="/tournaments">View All Tournaments</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 opacity-50"></div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05]"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection className="max-w-4xl mx-auto text-center space-y-8 bg-background/40 backdrop-blur-xl p-12 rounded-3xl border border-white/10 shadow-2xl">
              <h2 className="text-4xl md:text-6xl font-bold text-balance tracking-tight">
                Ready to Start Competing?
              </h2>
              <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
                Join thousands of players in the ultimate esports experience. Create your legacy today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button asChild size="lg" className="text-lg h-14 px-10 rounded-full w-full sm:w-auto shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all">
                  <Link href="/register">
                    Create Your Account
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-lg h-14 px-10 rounded-full w-full sm:w-auto bg-transparent border-primary/20 hover:bg-primary/10 hover:scale-105 transition-all">
                  <Link href="/tournaments">
                    Explore First
                  </Link>
                </Button>
              </div>
            </AnimatedSection>
          </div>
        </section>
      )}
    </div>
  )
}

