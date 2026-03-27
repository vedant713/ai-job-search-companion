import { NextResponse } from "next/server"
import { initializeLocalDb, localDb } from "@/lib/local-db"

export async function GET() {
  try {
    await initializeLocalDb()
    
    const apps = localDb.applications.getAll()
    const taskList = localDb.tasks.getAll()
    const skillList = localDb.skills.getAll()

    const totalApplications = apps.length
    const appliedCount = apps.filter((app) => app.status === "Applied").length
    const interviewingCount = apps.filter((app) => app.status === "Interviewing").length
    const offerCount = apps.filter((app) => app.status === "Offer").length
    const rejectedCount = apps.filter((app) => app.status === "Rejected").length

    const totalTasks = taskList.length
    const completedTasks = taskList.filter((task) => task.is_complete).length
    const pendingTasks = totalTasks - completedTasks

    const totalSkills = skillList.length
    const averageLevel = totalSkills > 0
      ? skillList.reduce((sum, skill) => sum + skill.proficiency, 0) / totalSkills
      : 0

    const stats = {
      applications: {
        total: totalApplications,
        applied: appliedCount,
        interviewing: interviewingCount,
        offers: offerCount,
        rejected: rejectedCount,
        responseRate: totalApplications > 0 
          ? Math.round(((offerCount + interviewingCount) / totalApplications) * 100) 
          : 0,
        thisWeek: 0,
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks,
      },
      skills: {
        total: totalSkills,
        averageLevel: Math.round(averageLevel * 10) / 10,
      },
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
