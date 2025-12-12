"use client"

import { useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatedSection } from "@/components/ui/animated-section"
import Link from "next/link"
import { 
  Trophy, Users, Calendar, ArrowRight, Zap, Shield, Gamepad2, 
  Target, Award, BarChart3, Clock, CheckCircle2, Star,
  Sparkles, Globe, Lock, Swords, Crown, Medal, TrendingUp,
  UserPlus, Settings, Play, ChevronRight, Monitor, Smartphone
} from "lucide-react"
import { Logo } from "@/components/logo"

export default function HomePage() {
  const { user } = useAuth()
  const featuresRef = useRef<HTMLElement>(null)

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden bg-background">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background opacity-70"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl animate-float delay-500"></div>

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

            {/* Scroll indicator */}
            <AnimatedSection delay={500} className="pt-16">
              <button 
                onClick={scrollToFeatures}
                className="mx-auto flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
              >
                <span className="text-sm">Discover More</span>
                <div className="w-6 h-10 border-2 border-current rounded-full p-1 group-hover:border-primary transition-colors">
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce mx-auto"></div>
                </div>
              </button>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gradient-to-b from-background via-primary/5 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]"></div>
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { value: "500+", label: "Active Players", icon: Users },
              { value: "50+", label: "Tournaments", icon: Trophy },
              { value: "100+", label: "Teams", icon: Shield },
              { value: "24/7", label: "Support", icon: Clock },
            ].map((stat, i) => (
              <AnimatedSection key={i} delay={i * 100}>
                <div className="text-center group">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-3xl md:text-4xl font-black text-foreground mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent"></div>
        <div className="container mx-auto px-4 relative">
          <AnimatedSection className="text-center mb-16">
            <Badge className="mb-4" variant="outline">
              <Sparkles className="w-4 h-4 mr-2" />
              Platform Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Why Choose Esport Shield?</h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">Everything you need to elevate your competitive gaming experience</p>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Trophy,
                title: "Professional Tournaments",
                desc: "Compete in organized tournaments with automated brackets, real-time schedules, and secure prize pools.",
                color: "text-yellow-500",
                bgColor: "bg-yellow-500/10"
              },
              {
                icon: Users,
                title: "Team Management",
                desc: "Create and manage your team roster, recruit top talent, and track your team's performance history.",
                color: "text-blue-500",
                bgColor: "bg-blue-500/10"
              },
              {
                icon: Shield,
                title: "Secure Platform",
                desc: "Enterprise-grade security with role-based access control and verified player identities.",
                color: "text-green-500",
                bgColor: "bg-green-500/10"
              }
            ].map((feature, i) => (
              <AnimatedSection key={i} delay={i * 100}>
                <Card className="h-full border-primary/10 bg-card/30 backdrop-blur-sm hover:bg-card/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/5 group overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <CardHeader>
                    <div className={`w-16 h-16 rounded-2xl ${feature.bgColor} flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300 ${feature.color}`}>
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

      {/* How It Works Section */}
      <section className="py-32 bg-background relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-primary/5 to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative">
          <AnimatedSection className="text-center mb-20">
            <Badge className="mb-4" variant="outline">
              <Play className="w-4 h-4 mr-2" />
              Getting Started
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">How It Works</h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">Get started in minutes and join the competition</p>
          </AnimatedSection>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 relative">
              {/* Connection line */}
              <div className="hidden md:block absolute top-16 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20"></div>
              
              {[
                { step: "01", icon: UserPlus, title: "Create Account", desc: "Sign up with email or connect via Discord/Google" },
                { step: "02", icon: Users, title: "Join or Create Team", desc: "Build your squad or join an existing team" },
                { step: "03", icon: Trophy, title: "Enter Tournaments", desc: "Browse and register for upcoming competitions" },
                { step: "04", icon: Crown, title: "Compete & Win", desc: "Battle your way to victory and earn rewards" },
              ].map((item, i) => (
                <AnimatedSection key={i} delay={i * 150}>
                  <div className="text-center group">
                    <div className="relative inline-flex mb-6">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 relative z-10">
                        <div className="w-24 h-24 rounded-full bg-background flex items-center justify-center border-2 border-primary/30">
                          <item.icon className="w-10 h-10 text-primary" />
                        </div>
                      </div>
                      <span className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm z-20">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">{item.desc}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features Grid */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5"></div>
        
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <AnimatedSection>
              <Badge className="mb-4" variant="outline">
                <Target className="w-4 h-4 mr-2" />
                Tournament System
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                Professional-Grade Tournament Management
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Our advanced tournament system handles everything from registration to finals, with support for multiple formats and real-time bracket updates.
              </p>
              
              <div className="space-y-4">
                {[
                  { icon: CheckCircle2, text: "Single & Double Elimination Brackets" },
                  { icon: CheckCircle2, text: "Automated Match Scheduling" },
                  { icon: CheckCircle2, text: "Live Score Reporting" },
                  { icon: CheckCircle2, text: "Prize Pool Distribution" },
                  { icon: CheckCircle2, text: "Team Registration & Check-in" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-foreground">
                    <item.icon className="w-5 h-5 text-green-500 shrink-0" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>

              <Button asChild className="mt-8" size="lg">
                <Link href="/tournaments">
                  View Tournaments
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Link>
              </Button>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-3xl blur-3xl"></div>
                <div className="relative bg-card/50 backdrop-blur-sm border border-primary/20 rounded-3xl p-8 space-y-6">
                  {/* Mock bracket preview */}
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Championship Finals</h4>
                    <Badge variant="secondary">Live</Badge>
                  </div>
                  
                  <div className="space-y-4">
                    {[
                      { team: "Team Alpha", score: 2, winner: true },
                      { team: "Team Beta", score: 1, winner: false },
                    ].map((match, i) => (
                      <div key={i} className={`flex items-center justify-between p-4 rounded-xl ${match.winner ? 'bg-primary/10 border border-primary/30' : 'bg-background/50'}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                            <Swords className="w-5 h-5 text-primary" />
                          </div>
                          <span className={match.winner ? 'font-semibold' : 'text-muted-foreground'}>{match.team}</span>
                        </div>
                        <span className={`text-2xl font-bold ${match.winner ? 'text-primary' : 'text-muted-foreground'}`}>{match.score}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Prize Pool</span>
                      <span className="text-primary font-semibold">$5,000 BHD</span>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Team Management Section */}
      <section className="py-32 bg-background relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-purple-500/5 to-transparent"></div>
        
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <AnimatedSection className="order-2 lg:order-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl"></div>
                <div className="relative bg-card/50 backdrop-blur-sm border border-primary/20 rounded-3xl p-8">
                  {/* Team card mock */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xl">Phantom Squad</h4>
                      <p className="text-muted-foreground text-sm">Competitive Team</p>
                    </div>
                    <Badge className="ml-auto" variant="secondary">Pro</Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-3 bg-background/50 rounded-xl">
                      <div className="text-2xl font-bold text-primary">12</div>
                      <div className="text-xs text-muted-foreground">Wins</div>
                    </div>
                    <div className="text-center p-3 bg-background/50 rounded-xl">
                      <div className="text-2xl font-bold">5</div>
                      <div className="text-xs text-muted-foreground">Members</div>
                    </div>
                    <div className="text-center p-3 bg-background/50 rounded-xl">
                      <div className="text-2xl font-bold text-yellow-500">3</div>
                      <div className="text-xs text-muted-foreground">Trophies</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-sm font-medium mb-2">Team Roster</div>
                    {["Captain", "Player", "Player", "Player", "Sub"].map((role, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-background/30">
                        <div className="w-8 h-8 rounded-full bg-primary/20"></div>
                        <span className="text-sm">Player {i + 1}</span>
                        <Badge variant="outline" className="ml-auto text-xs">{role}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={200} className="order-1 lg:order-2">
              <Badge className="mb-4" variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Team System
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                Build Your Dream Team
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Create or join teams, manage rosters, and coordinate with teammates. Our team management system makes it easy to organize and compete together.
              </p>
              
              <div className="space-y-4">
                {[
                  { icon: UserPlus, text: "Easy team creation and invites" },
                  { icon: Settings, text: "Role management (Captain, Player, Sub)" },
                  { icon: BarChart3, text: "Team statistics and history" },
                  { icon: Globe, text: "Public team profiles" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-foreground">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-blue-500" />
                    </div>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>

              <Button asChild className="mt-8" size="lg" variant="outline">
                <Link href="/teams">
                  Explore Teams
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Link>
              </Button>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent"></div>
        
        <div className="container mx-auto px-4 relative">
          <AnimatedSection className="text-center mb-16">
            <Badge className="mb-4" variant="outline">
              <Gamepad2 className="w-4 h-4 mr-2" />
              Supported Games
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Compete Across Multiple Titles</h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">From FPS to MOBA, we support tournaments for all major esports titles</p>
          </AnimatedSection>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 max-w-5xl mx-auto">
            {[
              { name: "Valorant", color: "from-red-500/20 to-red-600/20" },
              { name: "CS2", color: "from-orange-500/20 to-yellow-500/20" },
              { name: "Rocket League", color: "from-blue-500/20 to-cyan-500/20" },
              { name: "FIFA", color: "from-green-500/20 to-emerald-500/20" },
              { name: "PUBG Mobile", color: "from-yellow-500/20 to-orange-500/20" },
              { name: "CoD Mobile", color: "from-gray-500/20 to-gray-600/20" },
            ].map((game, i) => (
              <AnimatedSection key={i} delay={i * 50}>
                <div className={`aspect-square rounded-2xl bg-gradient-to-br ${game.color} border border-white/10 flex flex-col items-center justify-center p-4 hover:scale-105 transition-transform cursor-pointer group`}>
                  <Gamepad2 className="w-10 h-10 text-foreground/70 mb-2 group-hover:text-primary transition-colors" />
                  <span className="text-sm font-medium text-center">{game.name}</span>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection delay={400} className="text-center mt-12">
            <p className="text-muted-foreground mb-4">And many more supported titles...</p>
            <Button variant="link" asChild className="text-primary">
              <Link href="/tournaments">View All Games <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </AnimatedSection>
        </div>
      </section>

      {/* Security & Trust Section */}
      <section className="py-32 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02]"></div>
        
        <div className="container mx-auto px-4 relative">
          <AnimatedSection className="text-center mb-16">
            <Badge className="mb-4" variant="outline">
              <Lock className="w-4 h-4 mr-2" />
              Security & Trust
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Built for Competitive Integrity</h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">We take fair play seriously with robust security measures</p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Shield, title: "Verified Accounts", desc: "Multi-factor authentication & OAuth integration" },
              { icon: Lock, title: "Secure Platform", desc: "Enterprise-grade encryption & data protection" },
              { icon: Award, title: "Fair Play", desc: "Anti-cheat monitoring & dispute resolution" },
              { icon: Globe, title: "Global Access", desc: "Worldwide availability with regional support" },
            ].map((item, i) => (
              <AnimatedSection key={i} delay={i * 100}>
                <Card className="h-full border-primary/10 bg-card/30 backdrop-blur-sm text-center p-6 hover:bg-card/50 transition-all">
                  <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-7 h-7 text-green-500" />
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials/Social Proof */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-purple-500/5 to-pink-500/5"></div>
        
        <div className="container mx-auto px-4 relative">
          <AnimatedSection className="text-center mb-16">
            <Badge className="mb-4" variant="outline">
              <Star className="w-4 h-4 mr-2" />
              Community
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Trusted by Competitors</h2>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">Join the growing community of esports enthusiasts</p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { 
                quote: "The tournament system is incredibly smooth. Best platform I've used for organizing our team's competitions.",
                author: "Team Captain",
                team: "Phoenix Rising",
                rating: 5
              },
              { 
                quote: "Finally a platform that understands competitive gaming. The bracket system and match reporting are top-notch.",
                author: "Tournament Organizer",
                team: "GCC Esports",
                rating: 5
              },
              { 
                quote: "From registration to prize distribution, everything just works. Highly recommend for any serious competitor.",
                author: "Pro Player",
                team: "Storm Brigade",
                rating: 5
              },
            ].map((testimonial, i) => (
              <AnimatedSection key={i} delay={i * 100}>
                <Card className="h-full border-primary/10 bg-card/30 backdrop-blur-sm p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="text-foreground mb-6 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20"></div>
                    <div>
                      <div className="font-medium text-sm">{testimonial.author}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.team}</div>
                    </div>
                  </div>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Access Section */}
      <section className="py-32 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <AnimatedSection>
              <Badge className="mb-4" variant="outline">
                <Monitor className="w-4 h-4 mr-2" />
                Access Anywhere
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                Compete From Any Device
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Access tournaments, manage your team, and stay updated from any device. Our responsive platform works seamlessly on desktop, tablet, and mobile.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-card/50 rounded-full border border-primary/20">
                  <Monitor className="w-5 h-5 text-primary" />
                  <span className="text-sm">Desktop</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-card/50 rounded-full border border-primary/20">
                  <Smartphone className="w-5 h-5 text-primary" />
                  <span className="text-sm">Mobile</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-card/50 rounded-full border border-primary/20">
                  <Globe className="w-5 h-5 text-primary" />
                  <span className="text-sm">Web Browser</span>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-3xl blur-3xl"></div>
                {/* Device mockup */}
                <div className="relative flex items-end gap-4">
                  {/* Desktop */}
                  <div className="w-48 h-32 bg-card/80 rounded-xl border border-primary/20 p-2 hidden md:block">
                    <div className="w-full h-full bg-background/50 rounded-lg flex items-center justify-center">
                      <Logo size={40} />
                    </div>
                  </div>
                  {/* Mobile */}
                  <div className="w-24 h-44 bg-card/80 rounded-2xl border border-primary/20 p-1.5">
                    <div className="w-full h-full bg-background/50 rounded-xl flex items-center justify-center">
                      <Logo size={32} />
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 opacity-50"></div>
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05]"></div>
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-primary/30 rounded-full blur-3xl animate-pulse-glow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl animate-pulse-glow delay-1000"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection className="max-w-4xl mx-auto text-center space-y-8 bg-background/40 backdrop-blur-xl p-12 md:p-16 rounded-3xl border border-white/10 shadow-2xl">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center mb-4">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl md:text-6xl font-bold text-balance tracking-tight">
                Ready to Start Competing?
              </h2>
              <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
                Join hundreds of players in the ultimate esports experience. Create your legacy today.
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

      {/* Logged in CTA */}
      {user && (
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <AnimatedSection className="max-w-4xl mx-auto text-center space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                Welcome back, <span className="text-primary">{user.username || "Champion"}</span>!
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Ready for your next competition? Check out the latest tournaments or manage your team.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button asChild size="lg" className="rounded-full">
                  <Link href="/tournaments">
                    Browse Tournaments
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full">
                  <Link href="/dashboard">
                    Go to Dashboard
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

