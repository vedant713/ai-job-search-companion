import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer, getUser } from "@/lib/supabase-server"

export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch applications
    const { data: applications, error: appsError } = await supabaseServer
      .from("applications")
      .select("status, created_at")
      .eq("user_id", user.id)

    if (appsError) {
      console.error("Applications error:", appsError)
      return NextResponse.json({ error: appsError.message }, { status: 500 })
    }

    // Fetch tasks
    const { data: tasks, error: tasksError } = await supabaseServer
      .from("tasks")
      .select("is_complete, created_at")
      .eq("user_id", user.id)

    if (tasksError) {
      console.error("Tasks error:", tasksError)
      return NextResponse.json({ error: tasksError.message }, { status: 500 })
    }

    // Fetch skills
    const { data: skills, error: skillsError } = await supabaseServer
      .from("skills")
      .select("proficiency")
      .eq("user_id", user.id)

    if (skillsError) {
      console.error("Skills error:", skillsError)
      return NextResponse.json({ error: skillsError.message }, { status: 500 })
    }

    // Calculate stats
    const totalApplications = applications?.length || 0
    const appliedCount = applications?.filter((app) => app.status === "Applied").length || 0
    const interviewingCount = applications?.filter((app) => app.status === "Interviewing").length || 0
    const offerCount = applications?.filter((app) => app.status === "Offer").length || 0
    const rejectedCount = applications?.filter((app) => app.status === "Rejected").length || 0

    const responseRate =
      totalApplications > 0 ? Math.round(((interviewingCount + offerCount) / totalApplications) * 100) : 0

    const totalTasks = tasks?.length || 0
    const completedTasks = tasks?.filter((task) => task.is_complete).length || 0

    const averageSkillLevel =
      skills?.length > 0 ? Math.round(skills.reduce((sum, skill) => sum + skill.proficiency, 0) / skills.length) : 0

    // Get recent applications (last week)
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const recentApplications = applications?.filter((app) => new Date(app.created_at) >= oneWeekAgo).length || 0

    const stats = {
      applications: {
        total: totalApplications,
        applied: appliedCount,
        interviewing: interviewingCount,
        offers: offerCount,
        rejected: rejectedCount,
        responseRate,
        thisWeek: recentApplications,
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        pending: totalTasks - completedTasks,
      },
      skills: {
        total: skills?.length || 0,
        averageLevel: averageSkillLevel,
      },
    }

    return NextResponse.json({ data: stats })
  } catch (error: any) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
