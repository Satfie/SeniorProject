"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Trophy, Loader2, ArrowRight, Shield, Gamepad2 } from "lucide-react"
import { toast } from "sonner"
import { AnimatedSection } from "@/components/ui/animated-section"

export default function LoginPage() {
  const { login, beginOAuth } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error("Please fill in all fields")
      return
    }

    setLoading(true)
    try {
      await login(email, password)
      toast.success("Welcome back!")
    } catch (error: any) {
      toast.error(error.message || "Invalid credentials")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex w-1/2 bg-black relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background z-10"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 z-0"></div>
        
        {/* Animated Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[100px] animate-pulse-glow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] animate-pulse-glow delay-1000"></div>

        <div className="relative z-20 p-12 text-center max-w-lg">
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/30 animate-float">
              <Trophy className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Dominate the Arena
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Join the ultimate esports platform. Compete in tournaments, manage your team, and climb the leaderboards.
          </p>
          
          <div className="mt-12 grid grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-white/5 backdrop-blur border border-white/10">
              <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="font-semibold">Secure Play</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 backdrop-blur border border-white/10">
              <Gamepad2 className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="font-semibold">Pro Tournaments</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5 pointer-events-none"></div>
        
        <div className="w-full max-w-md space-y-8 relative z-10">
          <AnimatedSection>
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-bold tracking-tight">Welcome Back</h2>
              <p className="text-muted-foreground">Sign in to your account to continue</p>
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
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link href="#" className="text-xs text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      required
                      className="bg-background/50 border-white/10 focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 text-base shadow-lg shadow-primary/20" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In <ArrowRight className="w-4 h-4 ml-2" />
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
                      <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
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
                    <Button type="button" variant="outline" className="w-full bg-background/50" disabled>
                      Google
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/register" className="text-primary hover:text-primary/80 font-semibold hover:underline transition-all">
                  Create an account
                </Link>
              </p>
            </div>

            {/* Test Credentials - Keep for development but style it better */}
            <div className="mt-8 p-4 rounded-lg bg-muted/30 border border-white/5 text-xs text-muted-foreground">
              <p className="font-semibold mb-2 text-center">Demo Credentials</p>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div>
                  <span className="block opacity-70">Admin</span>
                  <code className="bg-black/20 px-1 rounded">admin@example.com</code>
                </div>
                <div>
                  <span className="block opacity-70">Password</span>
                  <code className="bg-black/20 px-1 rounded">Admin123!</code>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  )
}
