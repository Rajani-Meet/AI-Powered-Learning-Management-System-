"use client"

import * as React from "react"
import { NextUIProvider } from "@nextui-org/react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextUIProvider>
      <NextThemesProvider {...props}>{children}</NextThemesProvider>
    </NextUIProvider>
  )
}