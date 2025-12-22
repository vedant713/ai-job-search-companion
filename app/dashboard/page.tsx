"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Sparkles, ArrowUpRight, ArrowRight } from "lucide-react"
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
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "Medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "Low":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20"
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-[calc(100vh-100px)] text-muted-foreground animate-pulse">Loading dashboard...</div>
  }

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, <span className="text-foreground font-medium">{user?.user_metadata?.full_name || "User"}</span>. Here's your job search overview.
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/applications")} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all hover:scale-105">
          <Plus className="mr-2 h-4 w-4" />
          Add Application
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="flex items-center justify-between">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Briefcase className="h-5 w-5" />
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded-full bg-green-500/10 text-green-500`}>
              +{stats?.applications.thisWeek || 0} this week
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold">{stats?.applications.total || 0}</h3>
            <p className="text-sm text-muted-foreground mt-1">Total Applications</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="flex items-center justify-between">
            <div className="p-2 bg-yellow-500/10 rounded-xl text-yellow-500">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold">{stats?.applications.interviewing || 0}</h3>
            <p className="text-sm text-muted-foreground mt-1">Active Interviews</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="flex items-center justify-between">
            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-500/10 text-blue-500">
              {stats?.applications.responseRate || 0}% Rate
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold">{stats?.applications.responseRate || 0}%</h3>
            <p className="text-sm text-muted-foreground mt-1">Response Rate</p>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="flex items-center justify-between">
            <div className="p-2 bg-green-500/10 rounded-xl text-green-500">
              <MessageSquare className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold">{stats?.applications.offers || 0}</h3>
            <p className="text-sm text-muted-foreground mt-1">Offers Received</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Analytics Area */}
        <div className="md:col-span-2 space-y-6">
          <RealTimeAnalytics />
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Quick AI Assistant - Modern Chat Style */}
          <Card className="glass-card bg-gradient-to-b from-card to-card/50 overflow-hidden border-primary/20">
            <CardHeader className="pb-3 border-b border-white/5 bg-primary/5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">AI Companion</CardTitle>
              </div>
              <CardDescription>Ask for career advice or tips</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="relative">
                <Input
                  placeholder="Ask me anything..."
                  className="pr-10 bg-background/50 border-white/10 focus:border-primary/50 text-sm h-11"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAiQuery()}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute right-1 top-1 h-9 w-9 text-primary hover:bg-primary/10 rounded-lg"
                  onClick={handleAiQuery}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Quick Prompts</p>
                <div className="flex flex-col gap-2">
                  {["Analyze my resume", "Draft cover letter", "Interview tips", "Salary negotiation"].map((suggestion) => (
                    <button
                      key={suggestion}
                      className="text-left text-sm px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all flex items-center justify-between group"
                      onClick={() => {
                        setAiQuery(suggestion)
                        // Optional: auto-submit or just fill
                      }}
                    >
                      {suggestion}
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Tasks - Modern List */}
          <Card className="glass-card">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Tasks</CardTitle>
              <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground" onClick={() => router.push("/dashboard/todos")}>View All</Button>
            </CardHeader>
            <CardContent>
              {recentTasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckSquare className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-3">No pending tasks</p>
                  <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/todos")}>
                    Add Task
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTasks.map((task) => (
                    <div
                      key={task.id}
                      className="group flex flex-col gap-1 p-3 rounded-xl bg-white/5 border border-transparent hover:border-white/10 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">{task.description}</span>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-5 ${getPriorityColor(task.priority)}`}>{task.priority}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No date"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mini Skill Stats */}
          <Card className="glass-card bg-gradient-to-br from-card to-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Skill Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{stats?.skills.averageLevel || 0}%</span>
                <span className="text-sm text-muted-foreground">avg. proficiency</span>
              </div>
              <div className="mt-3 h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-purple-500"
                  style={{ width: `${stats?.skills.averageLevel || 0}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
