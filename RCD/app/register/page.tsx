"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Trophy, Loader2, ArrowRight, Users, Star, Zap } from "lucide-react"
import { toast } from "sonner"
import { AnimatedSection } from "@/components/ui/animated-section"

export default function RegisterPage() {
  const { register, beginOAuth } = useAuth()
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
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-background/50"
                      onClick={() => beginOAuth("discord", "login")}
                    >
                      Discord
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-background/50"
                      onClick={() => beginOAuth("google", "login")}
                    >
                      Google
                    </Button>
                  </div>
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
