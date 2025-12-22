"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus } from "lucide-react"
import { Briefcase, Clock, TrendingUp, MessageSquare, CheckSquare, Target } from "lucide-react"
import { RealTimeAnalytics } from "@/components/real-time-analytics"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface DashboardStats {
  applications: {
    total: number
    applied: number
    interviewing: number
    offers: number
    rejected: number
    responseRate: number
    thisWeek: number
  }
  tasks: {
    total: number
    completed: number
    pending: number
  }
  skills: {
    total: number
    averageLevel: number
  }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [recentTasks, setRecentTasks] = useState<any[]>([])
  const [aiQuery, setAiQuery] = useState("")

  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      // Fetch applications
      const { data: applications, error: appsError } = await supabase
        .from("applications")
        .select("status, created_at")
        .eq("user_id", user?.id)

      if (appsError) throw appsError

      // Fetch tasks
      const { data: tasks, error: tasksError } = await supabase.from("tasks").select("*").eq("user_id", user?.id)

      if (tasksError) throw tasksError

      // Fetch skills
      const { data: skills, error: skillsError } = await supabase
        .from("skills")
        .select("proficiency, target_proficiency")
        .eq("user_id", user?.id)

      if (skillsError) throw skillsError

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
      const pendingTasks = totalTasks - completedTasks

      const averageSkillLevel =
        skills?.length > 0 ? Math.round(skills.reduce((sum, skill) => sum + skill.proficiency, 0) / skills.length) : 0

      // Get recent applications (last week)
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      const recentApplications = applications?.filter((app) => new Date(app.created_at) >= oneWeekAgo).length || 0

      setStats({
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
          pending: pendingTasks,
        },
        skills: {
          total: skills?.length || 0,
          averageLevel: averageSkillLevel,
        },
      })

      // Get upcoming tasks (not completed, due soon)
      const upcoming = tasks
        ?.filter((task: any) => !task.is_complete)
        .sort(
          (a: any, b: any) =>
            new Date(a.due_date || "9999-12-31").getTime() - new Date(b.due_date || "9999-12-31").getTime(),
        )
        .slice(0, 3)
      setRecentTasks(upcoming || [])
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAiQuery = () => {
    if (aiQuery.trim()) {
      router.push(`/dashboard/ai-assistant?query=${encodeURIComponent(aiQuery)}`)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "Low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading dashboard...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={() => router.push("/dashboard/applications")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Application
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.applications.total || 0}</div>
            <p className="text-xs text-muted-foreground">+{stats?.applications.thisWeek || 0} from last week</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Interviews</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.applications.interviewing || 0}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.applications.responseRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {stats?.applications.interviewing || 0} + {stats?.applications.offers || 0} responses
            </p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offers Received</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.applications.offers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.applications.offers === 0 ? "Keep applying!" : "Congratulations!"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.tasks.pending || 0}</div>
            <p className="text-xs text-muted-foreground">{stats?.tasks.completed || 0} completed</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skills Tracked</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.skills.total || 0}</div>
            <p className="text-xs text-muted-foreground">Avg level: {stats?.skills.averageLevel || 0}%</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.applications.thisWeek || 0}</div>
            <p className="text-xs text-muted-foreground">Applications sent</p>
          </CardContent>
        </Card>
      </div>

      {/* Replace the existing grid with charts */}
      <RealTimeAnalytics />

      {/* Quick AI Assistant */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Quick AI Assistant</CardTitle>
          <CardDescription>Ask me anything about your job search</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Ask AI: 'Suggest job titles for frontend roles'"
              className="flex-1"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAiQuery()}
            />
            <Button onClick={handleAiQuery}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-sm text-muted-foreground">Quick suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {["Write cover letter", "Interview prep", "Salary negotiation", "Follow-up email"].map((suggestion) => (
                <Badge
                  key={suggestion}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => {
                    setAiQuery(suggestion)
                    handleAiQuery()
                  }}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Tasks */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Upcoming Tasks</CardTitle>
          <CardDescription>Your next action items</CardDescription>
        </CardHeader>
        <CardContent>
          {recentTasks.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-2">No upcoming tasks</p>
              <Button variant="outline" onClick={() => router.push("/dashboard/todos")}>
                Add Task
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-600"
                >
                  <div>
                    <p className="font-medium">{task.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {task.due_date ? `Due: ${new Date(task.due_date).toLocaleDateString()}` : "No due date"}
                    </p>
                  </div>
                  <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => router.push("/dashboard/todos")}
              >
                View All Tasks
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
