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
  const { user, isLocalMode } = useAuth()

  useEffect(() => {
    if (user && !isLocalMode) {
      fetchAnalyticsData()
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
    } else if (isLocalMode) {
      setLoading(false)
    }
  }, [user, isLocalMode])

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

    // Modern colors using CSS variables would be better, but Recharts needs hex
    // We can use the hex equivalents of our theme (or close matches)
    const colors = {
      Applied: "#6366f1", // Indigo
      Interviewing: "#eab308", // Yellow
      Offer: "#10b981", // Emerald
      Rejected: "#ef4444", // Red
    }

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count as number,
      color: colors[status as keyof typeof colors] || "#8b5cf6",
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
          <Card key={i} className="glass-card h-[400px]">
            <CardHeader>
              <div className="h-4 w-1/3 bg-muted/20 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-full bg-muted/10 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Application Trend */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Application Trend</CardTitle>
          <CardDescription>Activity over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.applicationTrend}>
              <defs>
                <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#09090b", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }}
                itemStyle={{ color: "#fff" }}
              />
              <Legend />
              <Area type="monotone" dataKey="applications" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorApps)" name="Applied" strokeWidth={2} />
              <Area type="monotone" dataKey="responses" stroke="#10b981" fillOpacity={1} fill="url(#colorRes)" name="Responses" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Application Status</CardTitle>
          <CardDescription>Current pipeline distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.statusDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#09090b", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }}
                itemStyle={{ color: "#fff" }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Skill Progress */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Skill Progress</CardTitle>
          <CardDescription>Top 8 skills vs target</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.skillProgress} layout="vertical" barSize={10} barGap={0}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} stroke="rgba(255,255,255,0.5)" fontSize={12} />
              <YAxis dataKey="skill" type="category" width={100} stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#09090b", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
              <Legend />
              <Bar dataKey="current" fill="#8b5cf6" name="Current" radius={[0, 4, 4, 0]} />
              <Bar dataKey="target" fill="#2d2d30" name="Target" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Task Completion */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Productivity</CardTitle>
          <CardDescription>Tasks completed weekly</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.taskCompletion}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="week" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#09090b", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px" }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
              <Legend />
              <Bar dataKey="created" fill="#2d2d30" name="Created" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
