"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedSection } from "@/components/ui/animated-section"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

export default function AuthCallbackPage() {
  const params = useSearchParams()
  const router = useRouter()
  const { completeOAuthLogin, refreshUser } = useAuth()
  const token = params.get("token")
  const error = params.get("error")
  const errorMessage = params.get("message")
  const provider = params.get("provider") || "account"
  const mode = params.get("mode") || "login"
  const providerLabel = provider
    ? provider.charAt(0).toUpperCase() + provider.slice(1)
    : "Account"
  const returnTo = params.get("returnTo") || (mode === "link" ? "/profile" : "/dashboard")
  const needsEmail = params.get("needsEmail") === "1"
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing")

  useEffect(() => {
    if (error) {
      setStatus("error")
      return
    }
    if (!token) {
      setStatus("error")
      return
    }
    void (async () => {
      try {
        if (mode === "link") {
          // Link mode: user already logged in, just refresh and redirect
          if (typeof window !== "undefined") {
            // The token in link mode is still the user's original token
            // The backend has already linked the provider to their account
            localStorage.setItem("rcd_token", token)
          }
          await refreshUser()
          toast.success(`${providerLabel} account linked successfully!`)
          router.push(returnTo)
        } else {
          // Login mode
          const destination = needsEmail ? "/profile" : returnTo
          await completeOAuthLogin(token, destination)
          if (needsEmail) {
            toast.info("Complete your profile", {
              description: "Add a valid email address so we can reach you for tournament updates.",
            })
          }
        }
        setStatus("success")
      } catch (err) {
        console.error("[oauth] callback failure", err)
        setStatus("error")
      }
    })()
  }, [token, error, completeOAuthLogin, refreshUser, needsEmail, router, returnTo, mode, providerLabel])

  if (status === "processing") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <AnimatedSection>
          <Card className="border-primary/10 bg-card/60 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-center">
                {mode === "link" ? `Linking ${providerLabel}...` : "Signing you in..."}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">
                Finishing {providerLabel} authentication
              </p>
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <AnimatedSection>
        <Card className="border-destructive/20 bg-destructive/5 backdrop-blur max-w-md">
          <CardHeader className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-destructive" />
            <CardTitle>
              {mode === "link" ? "Unable to link account" : "Unable to sign you in"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {errorMessage || `We couldn't complete the ${providerLabel} ${mode === "link" ? "linking" : "sign-in"} flow.`}
            </p>
            {mode === "link" ? (
              <div className="flex flex-col gap-2">
                <Button onClick={() => router.push("/profile")} className="w-full">
                  Back to Profile
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Button onClick={() => router.push("/login")} className="w-full">
                  Back to Login
                </Button>
                <Button variant="outline" onClick={() => router.push("/register")} className="w-full">
                  Create an account
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </AnimatedSection>
    </div>
  )
}

