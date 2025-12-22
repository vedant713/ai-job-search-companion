"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface Task {
  id: string
  description: string
  due_date: string | null
  priority: "Low" | "Medium" | "High"
  status: "todo" | "in-progress" | "completed"
  context: string | null
  created_at: string
}

interface DragDropTasksProps {
  tasks?: Task[]
  onTaskUpdate?: () => void
}

const priorityColors = {
  Low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  High: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

const statusColumns = [
  { id: "todo", title: "To Do", color: "bg-gray-100 dark:bg-gray-800" },
  { id: "in-progress", title: "In Progress", color: "bg-blue-100 dark:bg-blue-800" },
  { id: "completed", title: "Completed", color: "bg-green-100 dark:bg-green-800" },
]

export function DragDropTasks({ tasks: propTasks, onTaskUpdate }: DragDropTasksProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (propTasks) {
      setTasks(propTasks)
    } else if (user) {
      fetchTasks()
    }
  }, [propTasks, user])

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
    }
  }

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          status: newStatus,
          is_complete: newStatus === "completed",
        })
        .eq("id", taskId)

      if (error) throw error

      setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus as any } : task)))

      if (onTaskUpdate) {
        onTaskUpdate()
      }

      toast({
        title: "Success",
        description: "Task status updated",
      })
    } catch (error: any) {
      console.error("Error updating task:", error)
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      })
    }
  }

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    if (draggedTask && draggedTask.status !== newStatus) {
      updateTaskStatus(draggedTask.id, newStatus)
    }
    setDraggedTask(null)
  }

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {statusColumns.map((column) => (
        <Card
          key={column.id}
          className={`${column.color} dark:border-gray-600`}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {column.title}
              <Badge variant="secondary">{getTasksByStatus(column.id).length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getTasksByStatus(column.id).map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  className="p-3 bg-white dark:bg-gray-700 rounded-lg border shadow-sm cursor-move hover:shadow-md transition-shadow"
                >
                  <div className="space-y-2">
                    <p className="font-medium text-sm">{task.description}</p>
                    {task.context && <p className="text-xs text-muted-foreground">{task.context}</p>}
                    <div className="flex items-center justify-between">
                      <Badge className={priorityColors[task.priority]} size="sm">
                        {task.priority}
                      </Badge>
                      {task.due_date && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(task.due_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {getTasksByStatus(column.id).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No tasks in {column.title.toLowerCase()}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
