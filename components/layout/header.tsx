"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LogOut, X, User } from "lucide-react"
import { useState } from "react"
import { signOut } from "next-auth/react"

export function Header() {
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/login", redirect: true })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary/20 group-hover:scale-105 transition-all duration-300">
              <span className="text-white font-bold text-sm">LMS</span>
            </div>
            <span className="font-bold text-lg hidden sm:inline group-hover:text-primary transition-colors duration-200">
              Learning Management System
            </span>
          </Link>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            {session?.user ? (
              <>
                {/* Desktop Navigation */}
                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/profile">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="hover:bg-accent/20 hover:scale-105 transition-all duration-200"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="text-destructive hover:bg-destructive/10 hover:scale-105 transition-all duration-200"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>

                {/* Mobile Menu Button */}
                <div className="sm:hidden flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:scale-110 transition-all duration-200"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    {mobileMenuOpen ? (
                      <X className="h-5 w-5" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <Link href="/auth/login">
                <Button className="bg-gradient-to-r from-primary to-accent hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && session?.user && (
          <nav className="sm:hidden pb-4 space-y-2 border-t border-border/40 pt-4 animate-in slide-in-from-top-2">
            <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start hover:bg-accent/20 transition-all duration-200">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:bg-destructive/10 transition-all duration-200"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </nav>
        )}
      </div>
    </header>
  )
}
