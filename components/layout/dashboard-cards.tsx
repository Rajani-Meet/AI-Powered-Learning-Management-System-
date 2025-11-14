"use client"

import { Card } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: number
  trendLabel?: string
  className?: string
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  trendLabel,
  className = "",
}: StatCardProps) {
  const isPositive = trend && trend >= 0

  return (
    <Card className={`p-6 hover:shadow-lg transition-all hover:border-primary/50 group ${className}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {value}
          </p>
          {trend !== undefined && (
            <div className="flex items-center gap-1 pt-2">
              {isPositive ? (
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              )}
              <span
                className={`text-xs font-medium ${
                  isPositive ? "text-green-500" : "text-red-500"
                }`}
              >
                {Math.abs(trend)}% {trendLabel || "from last month"}
              </span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 group-hover:from-primary/30 group-hover:to-accent/30 transition-colors">
          <div className="text-primary">{icon}</div>
        </div>
      </div>
    </Card>
  )
}

interface CourseCardProps {
  id: string
  title: string
  instructor: string
  students?: number
  progress?: number
  status?: "active" | "completed" | "draft"
  image?: string
  className?: string
}

export function CourseCard({
  id,
  title,
  instructor,
  students,
  progress,
  status = "active",
  image,
  className = "",
}: CourseCardProps) {
  const statusColors = {
    active: "bg-green-500/20 text-green-700 dark:text-green-400",
    completed: "bg-blue-500/20 text-blue-700 dark:text-blue-400",
    draft: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
  }

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-all group cursor-pointer ${className}`}>
      {/* Image */}
      <div className="h-40 bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden relative">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-4xl opacity-30">📚</div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">{title}</h3>
            <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${statusColors[status]}`}>
              {status}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{instructor}</p>
        </div>

        {students !== undefined && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>👥 {students} students</span>
          </div>
        )}

        {progress !== undefined && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

interface AssignmentCardProps {
  id: string
  title: string
  dueDate: Date
  status?: "pending" | "submitted" | "graded"
  score?: number
  maxScore?: number
}

export function AssignmentCard({
  id,
  title,
  dueDate,
  status = "pending",
  score,
  maxScore,
}: AssignmentCardProps) {
  const statusColors = {
    pending: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400",
    submitted: "bg-blue-500/20 text-blue-700 dark:text-blue-400",
    graded: "bg-green-500/20 text-green-700 dark:text-green-400",
  }

  const isOverdue = dueDate < new Date() && status === "pending"

  return (
    <Card className={`p-4 hover:shadow-lg transition-all ${isOverdue ? "border-red-500/50" : ""}`}>
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h4 className="font-semibold line-clamp-2">{title}</h4>
            <p className={`text-xs ${isOverdue ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}>
              Due: {dueDate.toLocaleDateString()}
            </p>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${statusColors[status]}`}>
            {status}
          </span>
        </div>

        {score !== undefined && maxScore !== undefined && (
          <div className="pt-2 border-t border-border/40">
            <p className="text-sm font-medium">
              Score: <span className="text-primary">{score}</span>/{maxScore}
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
