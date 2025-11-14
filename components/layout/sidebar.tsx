"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronDown,
  FileText,
  GraduationCap,
} from "lucide-react"
import { useSession } from "next-auth/react"
import { useState } from "react"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  roles?: string[]
  children?: NavItem[]
}

const navItems: NavItem[] = [
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
  {
    label: "Teaching",
    href: "/instructor/dashboard",
    icon: <GraduationCap className="h-5 w-5" />,
    roles: ["INSTRUCTOR"],
  },
  {
    label: "Administration",
    href: "/admin/dashboard",
    icon: <Users className="h-5 w-5" />,
    roles: ["ADMIN"],
    children: [
      { label: "Users", href: "/admin/users", icon: <Users className="h-4 w-4" /> },
      { label: "Courses", href: "/admin/courses", icon: <BookOpen className="h-4 w-4" /> },
      { label: "Reports", href: "/admin/reports", icon: <BarChart3 className="h-4 w-4" /> },
    ],
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    label: "Resources",
    href: "/resources",
    icon: <FileText className="h-5 w-5" />,
  },
]

export function Sidebar({ className = "" }: { className?: string }) {
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

  const filteredItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(session?.user?.role || "")
  )

  return (
    <aside className={`w-64 bg-card border-r border-border/40 overflow-y-auto ${className}`}>
      <nav className="p-4 space-y-2">
        {filteredItems.map((item) => (
          <div key={item.href}>
            <button
              onClick={() => item.children && toggleExpand(item.href)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                isActive(item.href)
                  ? "bg-gradient-to-r from-primary/20 to-accent/20 text-primary border border-primary/30"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <Link href={item.href} className="flex items-center gap-3 flex-1">
                {item.icon}
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
              {item.children && (
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    expandedItems.includes(item.href) ? "rotate-180" : ""
                  }`}
                />
              )}
            </button>

            {/* Submenu */}
            {item.children && expandedItems.includes(item.href) && (
              <div className="ml-2 mt-1 space-y-1 border-l border-border/40">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all ${
                      isActive(child.href)
                        ? "bg-accent/20 text-accent font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {child.icon}
                    <span>{child.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/40 bg-card/50">
        <div className="space-y-2">
          <Link href="/help">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
              <HelpCircle className="h-4 w-4 mr-2" />
              Help & Support
            </Button>
          </Link>
          <Link href="/settings">
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>
      </div>
    </aside>
  )
}
