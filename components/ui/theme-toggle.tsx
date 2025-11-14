"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Moon, Sun, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { theme, setTheme, themes } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full"
      >
        <Sun className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full transition-all hover:bg-accent"
        asChild
      >
        <div>
          {theme === "dark" ? (
            <Moon className="h-4 w-4 transition-transform" />
          ) : theme === "light" ? (
            <Sun className="h-4 w-4 transition-transform" />
          ) : (
            <Monitor className="h-4 w-4 transition-transform" />
          )}
          <span className="sr-only">Toggle theme</span>
        </div>
      </Button>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Theme Preferences</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={theme === "light"}
          onCheckedChange={() => setTheme("light")}
          className="cursor-pointer flex items-center gap-2"
        >
          <Sun className="h-4 w-4" />
          <span>Light</span>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={theme === "dark"}
          onCheckedChange={() => setTheme("dark")}
          className="cursor-pointer flex items-center gap-2"
        >
          <Moon className="h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={theme === "system"}
          onCheckedChange={() => setTheme("system")}
          className="cursor-pointer flex items-center gap-2"
        >
          <Monitor className="h-4 w-4" />
          <span>System</span>
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
