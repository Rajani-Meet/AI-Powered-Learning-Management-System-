"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronDown,
  GraduationCap,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  ClipboardList,
  Award,
  Calendar,
  TrendingUp,
  PlusCircle,
} from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  roles?: string[]
  children?: NavItem[]
  badge?: string | number
}

// Role-specific navigation items
const getRoleNavItems = (role?: string): NavItem[] => {
  switch (role) {
    case "ADMIN":
      return [
        {
          label: "Dashboard",
          href: "/admin/dashboard",
          icon: <LayoutDashboard className="h-5 w-5" />,
        },
        {
          label: "Users",
          href: "/admin/users",
          icon: <Users className="h-5 w-5" />,
        },
        {
          label: "Courses",
          href: "/admin/courses",
          icon: <BookOpen className="h-5 w-5" />,
        },
        {
          label: "Reports",
          href: "/admin/reports",
          icon: <BarChart3 className="h-5 w-5" />,
        },
        {
          label: "Analytics",
          href: "/analytics",
          icon: <TrendingUp className="h-5 w-5" />,
        },
      ]

    case "INSTRUCTOR":
      return [
        {
          label: "Dashboard",
          href: "/instructor/dashboard",
          icon: <LayoutDashboard className="h-5 w-5" />,
        },
        {
          label: "My Courses",
          href: "/instructor/dashboard",
          icon: <BookOpen className="h-5 w-5" />,
        },
        {
          label: "Create Course",
          href: "/instructor/courses/new",
          icon: <PlusCircle className="h-5 w-5" />,
        },
        {
          label: "Assignments",
          href: "/instructor/dashboard",
          icon: <ClipboardList className="h-5 w-5" />,
        },
        {
          label: "Students",
          href: "/instructor/dashboard",
          icon: <GraduationCap className="h-5 w-5" />,
        },
        {
          label: "Analytics",
          href: "/analytics",
          icon: <BarChart3 className="h-5 w-5" />,
        },
      ]

    case "STUDENT":
      return [
        {
          label: "Dashboard",
          href: "/student/dashboard",
          icon: <LayoutDashboard className="h-5 w-5" />,
        },
        {
          label: "My Courses",
          href: "/student/dashboard",
          icon: <BookOpen className="h-5 w-5" />,
        },
        {
          label: "Assignments",
          href: "/student/dashboard",
          icon: <ClipboardList className="h-5 w-5" />,
        },
        {
          label: "Grades",
          href: "/student/dashboard",
          icon: <Award className="h-5 w-5" />,
        },
        {
          label: "Schedule",
          href: "/student/dashboard",
          icon: <Calendar className="h-5 w-5" />,
        },
      ]

    default:
      return [
        {
          label: "Dashboard",
          href: "/dashboard",
          icon: <LayoutDashboard className="h-5 w-5" />,
        },
        {
          label: "Courses",
          href: "/courses",
          icon: <BookOpen className="h-5 w-5" />,
        },
      ]
  }
}

interface SidebarProps {
  className?: string
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function Sidebar({ className = "", isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpand = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href)
        ? prev.filter((item) => item !== href)
        : [...prev, href]
    )
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")

  // Get role-specific navigation items
  const navItems = getRoleNavItems(session?.user?.role)

  const getRoleColor = (role?: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30"
      case "INSTRUCTOR":
        return "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30"
      case "STUDENT":
        return "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-700 dark:text-gray-400"
    }
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/login", redirect: true })
  }

  return (
    <aside 
      className={cn(
        "bg-card border-r border-border/40 overflow-y-auto transition-all duration-300 relative flex flex-col",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* User Profile Section - Only show when not collapsed */}
      {!isCollapsed && session?.user && (
        <div className="p-4 border-b border-border/40 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarFallback className={cn("font-semibold", getRoleColor(session.user.role))}>
                {session.user.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{session.user.name || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
              <span className={cn("text-xs px-2 py-0.5 rounded-full mt-1 inline-block", getRoleColor(session.user.role))}>
                {session.user.role}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      {onToggleCollapse && (
        <div className="absolute top-4 right-2 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="h-8 w-8 hover:bg-accent/20"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}

      <nav className={cn("p-4 space-y-2 flex-1 overflow-y-auto", isCollapsed && "px-2")}>
        {navItems.map((item) => (
          <div key={item.href}>
            {isCollapsed ? (
              <Link
                href={item.href}
                title={item.label}
                className={cn(
                  "w-full flex items-center justify-center px-3 py-2.5 rounded-lg transition-all group relative",
                  isActive(item.href)
                    ? "bg-gradient-to-r from-primary/20 to-accent/20 text-primary"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {item.icon}
              </Link>
            ) : (
              <>
                {item.children ? (
                  <>
                    <button
                      onClick={() => toggleExpand(item.href)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all",
                        isActive(item.href)
                          ? "bg-gradient-to-r from-primary/20 to-accent/20 text-primary border border-primary/30"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {item.icon}
                        <span className="font-medium text-sm">{item.label}</span>
                      </div>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          expandedItems.includes(item.href) && "rotate-180"
                        )}
                      />
                    </button>

                    {/* Submenu */}
                    {expandedItems.includes(item.href) && (
                      <div className="ml-2 mt-1 space-y-1 border-l border-border/40">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all",
                              isActive(child.href)
                                ? "bg-accent/20 text-accent font-medium"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                            )}
                          >
                            {child.icon}
                            <span>{child.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                      isActive(item.href)
                        ? "bg-gradient-to-r from-primary/20 to-accent/20 text-primary border border-primary/30"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.icon}
                    <span className="font-medium text-sm">{item.label}</span>
                  </Link>
                )}
              </>
            )}
          </div>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className={cn(
        "mt-auto border-t border-border/40 bg-card/50 backdrop-blur-sm",
        isCollapsed ? "p-2" : "p-4"
      )}>
        <div className="space-y-2">
          {!isCollapsed && (
            <>
              <Link href="/profile">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent/20 transition-all duration-200"
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Link href="/settings">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent/20 transition-all duration-200"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Link href="/help">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent/20 transition-all duration-200"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help & Support
                </Button>
              </Link>
            </>
          )}
          {session?.user && (
            <Button
              variant="ghost"
              onClick={handleLogout}
              className={cn(
                "w-full text-destructive hover:bg-destructive/10 transition-all duration-200",
                isCollapsed ? "justify-center" : "justify-start"
              )}
              title={isCollapsed ? "Log out" : undefined}
            >
              <LogOut className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Log out</span>}
            </Button>
          )}
        </div>
      </div>
    </aside>
  )
}
