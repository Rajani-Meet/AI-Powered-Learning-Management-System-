"use client"

import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Palette, Check, AlertCircle, Info, Zap } from "lucide-react"

export function ThemeShowcase() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80">
      {/* Header with Theme Toggle */}
      <header className="sticky top-0 z-50 backdrop-blur-sm border-b border-border/50 bg-background/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">LMS Theme</h1>
              <p className="text-sm text-muted-foreground">Modern & Professional Design System</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Color Palette Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-foreground">Color Palette</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {/* Primary Color */}
            <Card className="overflow-hidden border-2 border-primary/20 hover:border-primary/50 transition-colors">
              <div className="h-32 bg-gradient-to-br from-primary to-primary/60 flex items-end justify-start p-4">
                <span className="text-white font-semibold text-sm">Primary</span>
              </div>
              <div className="p-4 bg-card">
                <p className="text-xs text-muted-foreground font-mono">#0ea5e9</p>
              </div>
            </Card>

            {/* Secondary Color */}
            <Card className="overflow-hidden border-2 border-secondary/20 hover:border-secondary/50 transition-colors">
              <div className="h-32 bg-gradient-to-br from-secondary to-secondary/60 flex items-end justify-start p-4">
                <span className="text-white font-semibold text-sm">Secondary</span>
              </div>
              <div className="p-4 bg-card">
                <p className="text-xs text-muted-foreground font-mono">#7c3aed</p>
              </div>
            </Card>

            {/* Accent Color */}
            <Card className="overflow-hidden border-2 border-accent/20 hover:border-accent/50 transition-colors">
              <div className="h-32 bg-gradient-to-br from-accent to-accent/60 flex items-end justify-start p-4">
                <span className="text-white font-semibold text-sm">Accent</span>
              </div>
              <div className="p-4 bg-card">
                <p className="text-xs text-muted-foreground font-mono">#06b6d4</p>
              </div>
            </Card>

            {/* Success Color */}
            <Card className="overflow-hidden border-2 border-green-500/20 hover:border-green-500/50 transition-colors">
              <div className="h-32 bg-gradient-to-br from-green-500 to-green-600 flex items-end justify-start p-4">
                <span className="text-white font-semibold text-sm">Success</span>
              </div>
              <div className="p-4 bg-card">
                <p className="text-xs text-muted-foreground font-mono">#22c55e</p>
              </div>
            </Card>

            {/* Destructive Color */}
            <Card className="overflow-hidden border-2 border-red-500/20 hover:border-red-500/50 transition-colors">
              <div className="h-32 bg-gradient-to-br from-red-500 to-red-600 flex items-end justify-start p-4">
                <span className="text-white font-semibold text-sm">Error</span>
              </div>
              <div className="p-4 bg-card">
                <p className="text-xs text-muted-foreground font-mono">#ef4444</p>
              </div>
            </Card>
          </div>
        </section>

        {/* Components Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-foreground">Components</h2>

          {/* Buttons */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Buttons
            </h3>
            <Card className="p-6 bg-card/50">
              <div className="flex flex-wrap gap-4">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="link">Link</Button>
              </div>
            </Card>
          </div>

          {/* Badges */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              Badges
            </h3>
            <Card className="p-6 bg-card/50">
              <div className="flex flex-wrap gap-4">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge className="bg-gradient-to-r from-primary to-accent">Gradient</Badge>
              </div>
            </Card>
          </div>

          {/* Status Messages */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              Status Messages
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4 border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950/20">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-900 dark:text-green-300">Success</h4>
                    <p className="text-sm text-green-700 dark:text-green-400">Operation completed successfully</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/20">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-300">Information</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400">Here's some helpful information</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-300">Warning</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">Please pay attention to this warning</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-red-900 dark:text-red-300">Error</h4>
                    <p className="text-sm text-red-700 dark:text-red-400">An error occurred</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Form Elements */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-foreground">Form Elements</h3>
            <Card className="p-6 bg-card/50 space-y-6">
              <div className="flex items-center space-x-3">
                <Switch id="theme-switch" />
                <Label htmlFor="theme-switch" className="cursor-pointer">
                  Enable notifications
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <Switch id="theme-switch-2" defaultChecked />
                <Label htmlFor="theme-switch-2" className="cursor-pointer">
                  Dark mode enabled
                </Label>
              </div>
            </Card>
          </div>
        </section>

        {/* Typography Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-foreground">Typography</h2>
          <Card className="p-8 bg-card/50 space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Heading 1</h1>
              <p className="text-muted-foreground">Large heading for page titles</p>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">Heading 2</h2>
              <p className="text-muted-foreground">Medium heading for sections</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Heading 3</h3>
              <p className="text-muted-foreground">Small heading for subsections</p>
            </div>
            <div>
              <p className="text-base mb-2">Body text</p>
              <p className="text-muted-foreground">This is regular body text with standard line height and spacing</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Small text</p>
              <p className="text-muted-foreground">Used for secondary information and captions</p>
            </div>
          </Card>
        </section>

        {/* Footer */}
        <footer className="text-center py-12 text-muted-foreground">
          <p>Theme showcase demonstrating the modern color palette and components</p>
        </footer>
      </main>
    </div>
  )
}
