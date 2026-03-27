"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Calendar, Clock, CheckCircle2, Circle, Trash2, ListTodo, Filter, LayoutList, Kanban, ArrowRight } from "lucide-react"
import { DragDropTasks } from "@/components/drag-drop-tasks"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import type { Task } from "@/lib/supabase"
import { Progress } from "@/components/ui/progress"

const priorityColors = {
  Low: "bg-green-500/10 text-green-500 border-green-500/20",
  Medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  High: "bg-red-500/10 text-red-500 border-red-500/20",
}

export default function TodosPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list")
  const [filterStatus, setFilterStatus] = useState("all")
  const [newTask, setNewTask] = useState({
    description: "",
    due_date: "",
    priority: "Medium" as const,
    context: "",
  })

  const { user, isLocalMode } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user && !isLocalMode) {
      fetchTasks()
    } else {
      setLoading(false)
    }
  }, [user, isLocalMode])

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (error: any) {
      console.error("Error fetching tasks:", error)
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddTask = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          ...newTask,
          user_id: user.id,
          due_date: newTask.due_date || null,
        })
        .select()
        .single()

      if (error) throw error

      setTasks([data, ...tasks])
      setNewTask({
        description: "",
        due_date: "",
        priority: "Medium",
        context: "",
      })
      setIsAddDialogOpen(false)

      toast({
        title: "Success",
        description: "Task added successfully",
      })
    } catch (error: any) {
      console.error("Error adding task:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add task",
        variant: "destructive",
      })
    }
  }

  const handleToggleComplete = async (taskId: string, isComplete: boolean) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          is_complete: isComplete,
          status: isComplete ? "completed" : "todo",
        })
        .eq("id", taskId)

      if (error) throw error

      setTasks(
        tasks.map((task) =>
          task.id === taskId ? { ...task, is_complete: isComplete, status: isComplete ? "completed" : "todo" } : task,
        ),
      )

      toast({
        title: "Success",
        description: `Task ${isComplete ? "completed" : "reopened"}`,
      })
    } catch (error: any) {
      console.error("Error updating task:", error)
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      })
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId)

      if (error) throw error

      setTasks(tasks.filter((task) => task.id !== taskId))

      toast({
        title: "Success",
        description: "Task deleted successfully",
      })
    } catch (error: any) {
      console.error("Error deleting task:", error)
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      })
    }
  }

  const filteredTasks = tasks.filter((task) => {
    if (filterStatus === "all") return true
    if (filterStatus === "completed") return task.is_complete
    if (filterStatus === "pending") return !task.is_complete
    return task.status === filterStatus
  })

  const completedCount = tasks.filter((task) => task.is_complete).length
  const pendingCount = tasks.length - completedCount
  const completionPercentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0

  if (loading) {
    return <div className="flex items-center justify-center h-[calc(100vh-100px)] text-muted-foreground animate-pulse">Loading tasks...</div>
  }

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto min-h-[calc(100vh-theme(spacing.4))]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent flex items-center gap-2">
            Tasks & To-Dos <ListTodo className="h-6 w-6 text-primary animate-pulse" />
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">Stay organized and track your daily progress</p>
        </div>

        <div className="flex gap-3 items-center">
          <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("list")}
              className={`h-8 px-3 ${viewMode === "list" ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white"}`}
            >
              <LayoutList className="h-4 w-4 mr-2" />
              List
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("kanban")}
              className={`h-8 px-3 ${viewMode === "kanban" ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white"}`}
            >
              <Kanban className="h-4 w-4 mr-2" />
              Board
            </Button>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all hover:scale-105">
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] glass-card border-white/10">
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
                <DialogDescription>Create a new task to track your progress.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-muted-foreground">Task Description</Label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="What needs to be done?"
                    className="bg-white/5 border-white/10 min-h-[100px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="due-date" className="text-muted-foreground">Due Date</Label>
                    <Input
                      id="due-date"
                      type="date"
                      value={newTask.due_date}
                      onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority" className="text-muted-foreground">Priority</Label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value) => setNewTask({ ...newTask, priority: value as any })}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#09090b] border-white/10 text-white">
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="context" className="text-muted-foreground">Context/Notes</Label>
                  <Input
                    id="context"
                    value={newTask.context || ""}
                    onChange={(e) => setNewTask({ ...newTask, context: e.target.value })}
                    placeholder="Additional context or notes"
                    className="bg-white/5 border-white/10"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddTask}>Add Task</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-card border-white/10 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12 bg-white/10 rounded-full p-8">
            <LayoutList className="h-12 w-12" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
            <Circle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{tasks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Acitve items in your list</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12 bg-white/10 rounded-full p-8">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completion Status</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between mb-2">
              <div className="text-3xl font-bold">{completionPercentage}%</div>
              <span className="text-xs text-muted-foreground mb-1">{completedCount} / {tasks.length} completed</span>
            </div>
            <Progress value={completionPercentage} className="h-2 bg-white/10" indicatorClassName="bg-green-500" />
          </CardContent>
        </Card>

        <Card className="glass-card border-white/10 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12 bg-white/10 rounded-full p-8">
            <Clock className="h-12 w-12 text-orange-500" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Requires your attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/10 w-fit">
        <Filter className="h-4 w-4 text-muted-foreground ml-2" />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px] bg-transparent border-none focus:ring-0">
            <SelectValue placeholder="Filter tasks" />
          </SelectTrigger>
          <SelectContent className="bg-[#09090b] border-white/10 text-white">
            <SelectItem value="all">All Tasks</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Task Display */}
      {viewMode === "kanban" ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <DragDropTasks tasks={filteredTasks} onTaskUpdate={fetchTasks} />
        </div>
      ) : (
        <Card className="glass-card border-white/10">
          <CardContent className="p-0">
            {filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <ListTodo className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="text-muted-foreground mb-4">No tasks found matching your filter</p>
                <Button onClick={() => setIsAddDialogOpen(true)} variant="outline" className="border-white/10 hover:bg-white/5">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Task
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-4 p-4 hover:bg-white/5 transition-colors group animate-in fade-in"
                  >
                    <Checkbox
                      checked={task.is_complete}
                      onCheckedChange={(checked) => handleToggleComplete(task.id, checked as boolean)}
                      className="mt-1.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary border-white/20"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-1">
                          <p className={`font-medium text-base transition-all ${task.is_complete ? "line-through text-muted-foreground" : "text-foreground"
                            }`}>
                            {task.description}
                          </p>
                          {task.context && <p className="text-sm text-muted-foreground">{task.context}</p>}
                        </div>

                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task.id)} className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 h-8 w-8">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                        <Badge variant="outline" className={`font-medium ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
                          {task.priority}
                        </Badge>
                        {task.due_date && (
                          <div className={`flex items-center gap-1.5 ${new Date(task.due_date) < new Date() && !task.is_complete ? "text-red-400" : ""
                            }`}>
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Due {new Date(task.due_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
