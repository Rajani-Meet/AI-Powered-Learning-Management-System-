"use client"

import type React from "react"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@nextui-org/button"
import { Input } from "@nextui-org/input"
import { Card, CardBody } from "@nextui-org/card"
import { AlertCircle, Loader2, Mail, Lock, BookOpen, GraduationCap } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid email or password")
      } else if (result?.ok) {
        router.push("/dashboard")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col items-center justify-center text-center space-y-6 p-8">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-3xl opacity-20 animate-pulse"></div>
            <div className="relative p-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl border border-primary/20">
              <GraduationCap className="h-20 w-20 text-primary" />
            </div>
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Learning Management System
            </h1>
            <p className="text-lg text-muted-foreground max-w-md">
              Empower your learning journey with our comprehensive platform designed for students, instructors, and administrators.
            </p>
          </div>
          <div className="flex items-center gap-6 mt-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success"></div>
              <span>AI-Powered</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <span>Interactive Learning</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-accent"></div>
              <span>Real-time Analytics</span>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-2xl border-0">
            <CardBody className="p-8 lg:p-10">
              <div className="space-y-8">
                {/* Header */}
                <div className="text-center space-y-2">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10">
                      <BookOpen className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight">Welcome Back</h2>
                  <p className="text-muted-foreground">Sign in to your account to continue</p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-4 rounded-xl bg-destructive/10 border-2 border-destructive/20 flex items-start gap-3 animate-in slide-in-from-top-2">
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-destructive font-medium">{error}</p>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      required
                      variant="bordered"
                      startContent={<Mail className="h-4 w-4 text-default-400" />}
                      classNames={{
                        input: "text-base",
                        inputWrapper: "border-2 hover:border-primary/50 transition-colors h-12"
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-semibold flex items-center gap-2">
                      <Lock className="h-4 w-4 text-primary" />
                      Password
                    </label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      required
                      variant="bordered"
                      startContent={<Lock className="h-4 w-4 text-default-400" />}
                      classNames={{
                        input: "text-base",
                        inputWrapper: "border-2 hover:border-primary/50 transition-colors h-12"
                      }}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    color="primary"
                    size="lg"
                    className="w-full font-semibold shadow-lg hover:shadow-xl transition-all h-12"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>

                {/* Footer */}
                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-center text-muted-foreground">
                    Secure login powered by NextAuth.js
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
