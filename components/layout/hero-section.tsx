"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, Users, Sparkles } from "lucide-react"

export function HeroSection() {
  return (
    <div className="relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-background pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Text */}
          <div className="space-y-6 animate-fade-in-down">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">AI-Powered Learning</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight">
                Learn with
                <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Intelligent Assistance
                </span>
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-xl">
              Experience the future of education with AI-powered transcripts, summaries, and personalized learning paths.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/courses">
                <Button size="lg" className="bg-gradient-to-r from-primary to-accent group">
                  Explore Courses
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Right side - Features */}
          <div className="space-y-4 animate-fade-in-up">
            <div className="p-6 rounded-xl border border-border/40 bg-card/50 backdrop-blur hover:shadow-lg transition-all hover:border-primary/50 hover:bg-card">
              <div className="flex gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Rich Content Library</h3>
                  <p className="text-sm text-muted-foreground">Access thousands of courses from expert instructors</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-border/40 bg-card/50 backdrop-blur hover:shadow-lg transition-all hover:border-accent/50 hover:bg-card">
              <div className="flex gap-4">
                <div className="p-3 rounded-lg bg-accent/10">
                  <Sparkles className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold">AI-Powered Tools</h3>
                  <p className="text-sm text-muted-foreground">Get instant transcripts and intelligent summaries</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-border/40 bg-card/50 backdrop-blur hover:shadow-lg transition-all hover:border-primary/50 hover:bg-card">
              <div className="flex gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Collaborative Learning</h3>
                  <p className="text-sm text-muted-foreground">Learn together with peers and instructors</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface FeatureGridProps {
  features: Array<{
    icon: React.ReactNode
    title: string
    description: string
  }>
}

export function FeatureGrid({ features }: FeatureGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((feature, idx) => (
        <div
          key={idx}
          className="p-6 rounded-lg border border-border/40 bg-card hover:shadow-lg transition-all hover:border-primary/50 group"
        >
          <div className="p-3 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 w-fit mb-4 group-hover:from-primary/30 group-hover:to-accent/30 transition-colors">
            {feature.icon}
          </div>
          <h3 className="font-semibold mb-2">{feature.title}</h3>
          <p className="text-sm text-muted-foreground">{feature.description}</p>
        </div>
      ))}
    </div>
  )
}
