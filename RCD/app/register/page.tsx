"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Trophy, Loader2, ArrowRight, Users, Star, Zap } from "lucide-react"
import { toast } from "sonner"
import { AnimatedSection } from "@/components/ui/animated-section"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

export default function RegisterPage() {
  const { register, beginOAuth } = useAuth()
  const [providerStatus, setProviderStatus] = useState<{discord: boolean; google: boolean}>({ discord: true, google: true })
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !username || !password || !confirmPassword) {
      toast.error("Please fill in all required fields")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }

    setLoading(true)
    try {
      await register(email, password, username)
      toast.success("Account created successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to create account")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    import("@/lib/api").then(({ api }) => {
      api.getProviderStatus().then((status) => {
        if (mounted) setProviderStatus(status)
      }).catch(() => {
        // If status endpoint fails, leave buttons enabled
      })
    })
    return () => { mounted = false }
  }, [])

  return (
    <div className="min-h-screen w-full flex flex-row-reverse">
      {/* Right Side - Visual */}
      <div className="hidden lg:flex w-1/2 bg-black relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-bl from-purple-600/20 via-background to-background z-10"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 z-0"></div>
        
        {/* Animated Orbs */}
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-500/30 rounded-full blur-[100px] animate-pulse-glow"></div>
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[80px] animate-pulse-glow delay-700"></div>

        <div className="relative z-20 p-12 text-center max-w-lg">
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/30 animate-float delay-150">
              <Users className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Join the Squad
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Create your legacy. Form teams, challenge rivals, and earn your place in the hall of fame.
          </p>
          
          <div className="mt-12 space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur border border-white/10">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Rise to Glory</p>
                <p className="text-sm text-muted-foreground">Climb the seasonal leaderboards</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur border border-white/10">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Instant Action</p>
                <p className="text-sm text-muted-foreground">Quick matchmaking and tournament entry</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none"></div>
        
        <div className="w-full max-w-md space-y-8 relative z-10">
          <AnimatedSection>
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-bold tracking-tight">Create Account</h2>
              <p className="text-muted-foreground">Enter your details to get started</p>
            </div>

            <Card className="border-primary/10 bg-card/50 backdrop-blur shadow-xl">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      required
                      className="bg-background/50 border-white/10 focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Choose a unique username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={loading}
                      required
                      className="bg-background/50 border-white/10 focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Min 8 chars"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        required
                        className="bg-background/50 border-white/10 focus:border-primary/50 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Repeat password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading}
                        required
                        className="bg-background/50 border-white/10 focus:border-primary/50 transition-colors"
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full h-11 text-base shadow-lg shadow-primary/20 mt-2" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create Account <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-muted"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or register with</span>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full bg-background/50 transition-transform hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10"
                          disabled={!providerStatus.discord}
                          onClick={() => beginOAuth("discord", "login")}
                        >
                          <span className="inline-flex items-center justify-center w-5 h-5 mr-2 flex-shrink-0 [filter:drop-shadow(0_0_6px_rgba(88,101,242,0.35))]">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="w-full h-full">
                              <path fill="#5865F2" d="M20.317 4.369A19.791 19.791 0 0 0 16.672 3c-.2.356-.43.822-.589 1.194a18.027 18.027 0 0 0-4.165 0A12.3 12.3 0 0 0 11.32 3c-1.973.34-3.645.963-4.961 1.769C3.758 7.164 3 10.077 3 12.926c0 .12.003.239.01.357 1.738 1.268 3.804 2.245 6.034 2.738.464-.638.879-1.312 1.238-2.016a11.87 11.87 0 0 1-1.78-.68c.15-.11.297-.226.437-.347 3.457 1.62 7.202 1.62 10.658 0 .142.121.29.236.44.347-.569.245-1.162.463-1.777.68.359.704.773 1.378 1.238 2.016 2.233-.493 4.298-1.474 6.036-2.743.01-.118.014-.235.014-.353 0-2.858-.759-5.77-2.683-8.557ZM9.276 13.995c-.848 0-1.54-.77-1.54-1.713 0-.943.684-1.713 1.54-1.713.854 0 1.546.77 1.54 1.713 0 .943-.686 1.713-1.54 1.713Zm5.448 0c-.848 0-1.54-.77-1.54-1.713 0-.943.684-1.713 1.54-1.713.854 0 1.546.77 1.54 1.713 0 .943-.686 1.713-1.54 1.713Z"/>
                            </svg>
                          </span>
                          <span>Discord</span>
                        </Button>
                      </TooltipTrigger>
                      {!providerStatus.discord && (
                        <TooltipContent sideOffset={8}>Discord sign-in is not configured</TooltipContent>
                      )}
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full bg-background/50 transition-transform hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10"
                          disabled={!providerStatus.google}
                          onClick={() => beginOAuth("google", "login")}
                        >
                          <span className="inline-flex items-center justify-center w-5 h-5 mr-2 flex-shrink-0 [filter:drop-shadow(0_0_6px_rgba(234,67,53,0.35))]">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="w-full h-full">
                              <path fill="#EA4335" d="M12 10.2v3.6h5.1c-.2 1.3-1.5 3.8-5.1 3.8-3.1 0-5.6-2.6-5.6-5.8S8.9 6 12 6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.9 3.8 14.6 3 12 3 7 3 3 7 3 12s4 9 9 9c5.2 0 8.6-3.7 8.6-8.9 0-.6-.1-1.2-.2-1.7H12Z"/>
                            </svg>
                          </span>
                          <span className="relative">Google</span>
                        </Button>
                      </TooltipTrigger>
                      {!providerStatus.google && (
                        <TooltipContent sideOffset={8}>Google sign-in is not configured</TooltipContent>
                      )}
                    </Tooltip>
                  </div>

                  {!providerStatus.discord && !providerStatus.google && (
                    <p className="mt-3 text-xs text-muted-foreground text-center">
                      Third‑party sign‑in is unavailable. Please finish registration above.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:text-primary/80 font-semibold hover:underline transition-all">
                  Sign in
                </Link>
              </p>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  )
}
