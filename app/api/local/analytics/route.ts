import { NextResponse } from "next/server"
import { initializeLocalDb, localDb } from "@/lib/local-db"

export async function GET() {
  try {
    await initializeLocalDb()
    
    const apps = localDb.applications.getAll()
    const taskList = localDb.tasks.getAll()
    const skillList = localDb.skills.getAll()

    // Process application trend data (last 30 days)
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      return date.toISOString().split("T")[0]
    })

    const applicationTrend = last30Days.map((date) => {
      const dayApplications = apps.filter((app) => {
        if (!app.date_applied) return false
        const appDate = app.date_applied.split("T")[0]
        return appDate === date
      })
      const dayResponses = apps.filter(
        (app) => {
          if (!app.date_applied) return false
          const appDate = app.date_applied.split("T")[0]
          return appDate === date && (app.status === "Interviewing" || app.status === "Offer")
        }
      )
      return {
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        applications: dayApplications.length,
        responses: dayResponses.length,
      }
    })

    // Process status distribution
    const statusCounts: Record<string, number> = apps.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const colors: Record<string, string> = {
      Applied: "#6366f1",
      Interviewing: "#eab308",
      Offer: "#10b981",
      Rejected: "#ef4444",
      Saved: "#8b5cf6",
    }

    const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count as number,
      color: colors[status] ?? "#8b5cf6",
    }))

    // Process skill progress (top 8)
    const skillProgress = skillList.slice(0, 8).map((skill) => ({
      skill: skill.skill_name,
      current: skill.proficiency,
      target: skill.target_proficiency || skill.proficiency,
    }))

    // Process task completion (last 8 weeks)
    const last8Weeks = Array.from({ length: 8 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (7 - i) * 7)
      return {
        week: `Week ${i + 1}`,
        start: new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000),
        end: date,
      }
    })

    const taskCompletion = last8Weeks.map((week) => {
      const weekTasks = taskList.filter((task) => {
        const taskDate = new Date(task.created_at)
        return taskDate >= week.start && taskDate <= week.end
      })
      const completed = weekTasks.filter((task) => task.is_complete).length
      const created = weekTasks.length
      return {
        week: week.week,
        completed,
        created,
      }
    })

    return NextResponse.json({
      applicationTrend,
      statusDistribution,
      skillProgress,
      taskCompletion,
    })
  } catch (error) {
    console.error("Error fetching local analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
