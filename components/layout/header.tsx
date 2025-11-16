"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { LogOut, Menu, X } from "lucide-react"
import { useState } from "react"
import { signOut } from "next-auth/react"

export function Header() {
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const getRoleColor = (role?: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-500/20 text-red-700 dark:text-red-400"
      case "INSTRUCTOR":
        return "bg-blue-500/20 text-blue-700 dark:text-blue-400"
      case "STUDENT":
        return "bg-green-500/20 text-green-700 dark:text-green-400"
      default:
        return "bg-gray-500/20 text-gray-700 dark:text-gray-400"
    }
  }

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
              <span className="text-white font-bold text-sm">LMS</span>
            </div>
            <span className="font-bold text-lg hidden sm:inline group-hover:text-primary transition-colors duration-200">EduPlatform</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {session?.user && session.user.role === "ADMIN" && (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" className="hover:bg-accent/20 hover:scale-105 transition-all duration-200">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost" className="hover:bg-accent/20 hover:scale-105 transition-all duration-200">
                    Profile
                  </Button>
                </Link>
                <Link href="/admin/dashboard">
                  <Button variant="ghost" className="hover:bg-accent/20 hover:scale-105 transition-all duration-200">
                    Admin
                  </Button>
                </Link>
              </>
            )}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            {session?.user ? (
              <div className="hidden sm:flex items-center gap-3">
                {(session.user.role === "STUDENT" || session.user.role === "INSTRUCTOR") ? (
                  <Link href="/profile" className="flex items-center gap-2 hover:bg-accent/10 p-2 rounded-lg transition-all duration-200 hover:scale-105">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors duration-200">
                      <span className="text-sm font-medium text-primary">
                        {session.user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{session.user.name}</span>
                  </Link>
                ) : (
                  <>
                    <div className="text-right">
                      <p className="text-sm font-medium">{session.user.name}</p>
                      <p className={`text-xs px-2 py-1 rounded-full ${getRoleColor(session.user.role)}`}>
                        {session.user.role}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => signOut()}
                      className="hover:bg-destructive/10 hover:scale-110 transition-all duration-200"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <Link href="/auth/login">
                <Button className="bg-gradient-to-r from-primary to-accent hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                  Sign In
                </Button>
              </Link>
            )}

            {/* Mobile Menu */}
            {session?.user?.role === "ADMIN" && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden hover:scale-110 transition-all duration-200"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 space-y-2 border-t border-border/40">
            {session?.user && (
              <>
                {(session.user.role === "STUDENT" || session.user.role === "INSTRUCTOR") ? (
                  <Link href="/profile">
                    <Button variant="ghost" className="w-full justify-start hover:bg-accent/20 hover:scale-[1.02] transition-all duration-200">
                      Profile
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/dashboard">
                      <Button variant="ghost" className="w-full justify-start hover:bg-accent/20 hover:scale-[1.02] transition-all duration-200">
                        Dashboard
                      </Button>
                    </Link>
                    <Link href="/profile">
                      <Button variant="ghost" className="w-full justify-start hover:bg-accent/20 hover:scale-[1.02] transition-all duration-200">
                        Profile
                      </Button>
                    </Link>
                    <Link href="/admin/dashboard">
                      <Button variant="ghost" className="w-full justify-start hover:bg-accent/20 hover:scale-[1.02] transition-all duration-200">
                        Admin
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-destructive hover:bg-destructive/10 hover:scale-[1.02] transition-all duration-200"
                      onClick={() => signOut()}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                )}
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
