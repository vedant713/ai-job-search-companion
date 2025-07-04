"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"

interface AnalyticsData {
  applicationTrend: Array<{ date: string; applications: number; responses: number }>
  statusDistribution: Array<{ name: string; value: number; color: string }>
  skillProgress: Array<{ skill: string; current: number; target: number }>
  taskCompletion: Array<{ week: string; completed: number; created: number }>
}

export function RealTimeAnalytics() {
  const [data, setData] = useState<AnalyticsData>({
    applicationTrend: [],
    statusDistribution: [],
    skillProgress: [],
    taskCompletion: [],
  })
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchAnalyticsData()
      // Set up real-time subscription
      const subscription = supabase
        .channel("analytics_updates")
        .on("postgres_changes", { event: "*", schema: "public", table: "applications" }, () => {
          fetchAnalyticsData()
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => {
          fetchAnalyticsData()
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "skills" }, () => {
          fetchAnalyticsData()
        })
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [user])

  const fetchAnalyticsData = async () => {
    try {
      // Fetch applications for trend analysis
      const { data: applications } = await supabase
        .from("applications")
        .select("status, created_at, date_applied")
        .eq("user_id", user?.id)

      // Fetch skills for progress tracking
      const { data: skills } = await supabase
        .from("skills")
        .select("skill_name, proficiency, target_proficiency")
        .eq("user_id", user?.id)

      // Fetch tasks for completion tracking
      const { data: tasks } = await supabase.from("tasks").select("is_complete, created_at").eq("user_id", user?.id)

      // Process application trend data
      const applicationTrend = processApplicationTrend(applications || [])

      // Process status distribution
      const statusDistribution = processStatusDistribution(applications || [])

      // Process skill progress
      const skillProgress = processSkillProgress(skills || [])

      // Process task completion
      const taskCompletion = processTaskCompletion(tasks || [])

      setData({
        applicationTrend,
        statusDistribution,
        skillProgress,
        taskCompletion,
      })
    } catch (error) {
      console.error("Error fetching analytics data:", error)
    } finally {
      setLoading(false)
    }
  }

  const processApplicationTrend = (applications: any[]) => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      return date.toISOString().split("T")[0]
    })

    return last30Days.map((date) => {
      const dayApplications = applications.filter((app) => app.date_applied === date)
      const dayResponses = applications.filter(
        (app) => app.date_applied === date && (app.status === "Interviewing" || app.status === "Offer"),
      )

      return {
        date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        applications: dayApplications.length,
        responses: dayResponses.length,
      }
    })
  }

  const processStatusDistribution = (applications: any[]) => {
    const statusCounts = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1
      return acc
    }, {})

    const colors = {
      Applied: "#3b82f6",
      Interviewing: "#f59e0b",
      Offer: "#10b981",
      Rejected: "#ef4444",
    }

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count as number,
      color: colors[status as keyof typeof colors] || "#6b7280",
    }))
  }

  const processSkillProgress = (skills: any[]) => {
    return skills.slice(0, 8).map((skill) => ({
      skill: skill.skill_name,
      current: skill.proficiency,
      target: skill.target_proficiency || skill.proficiency,
    }))
  }

  const processTaskCompletion = (tasks: any[]) => {
    const last8Weeks = Array.from({ length: 8 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (7 - i) * 7)
      return {
        week: `Week ${i + 1}`,
        start: new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000),
        end: date,
      }
    })

    return last8Weeks.map((week) => {
      const weekTasks = tasks.filter((task) => {
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
  }

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <div className="h-4 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Application Trend */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Application Trend</CardTitle>
          <CardDescription>Applications sent and responses received over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.applicationTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" stroke="var(--foreground)" />
              <YAxis stroke="var(--foreground)" />
              <Tooltip contentStyle={{ backgroundColor: "var(--background)", border: "1px solid var(--border)" }} />
              <Legend />
              <Line type="monotone" dataKey="applications" stroke="#3b82f6" name="Applications" strokeWidth={2} />
              <Line type="monotone" dataKey="responses" stroke="#10b981" name="Responses" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Application Status</CardTitle>
          <CardDescription>Distribution of application statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Skill Progress */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Skill Progress</CardTitle>
          <CardDescription>Current vs target skill levels</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.skillProgress} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" domain={[0, 100]} stroke="var(--foreground)" />
              <YAxis dataKey="skill" type="category" width={80} stroke="var(--foreground)" />
              <Tooltip contentStyle={{ backgroundColor: "var(--background)", border: "1px solid var(--border)" }} />
              <Legend />
              <Bar dataKey="current" fill="#3b82f6" name="Current" />
              <Bar dataKey="target" fill="#10b981" name="Target" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Task Completion */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Task Completion</CardTitle>
          <CardDescription>Tasks created vs completed over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.taskCompletion}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="week" stroke="var(--foreground)" />
              <YAxis stroke="var(--foreground)" />
              <Tooltip contentStyle={{ backgroundColor: "var(--background)", border: "1px solid var(--border)" }} />
              <Legend />
              <Area type="monotone" dataKey="created" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="Created" />
              <Area type="monotone" dataKey="completed" stackId="1" stroke="#10b981" fill="#10b981" name="Completed" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
