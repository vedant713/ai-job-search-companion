"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Plus, Trash2 } from "lucide-react"
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
  tags: string[] | null
  is_complete: boolean
  created_at: string
}

interface DragDropTasksProps {
  tasks?: Task[]
  onTaskUpdate?: () => void
}

const priorityColors = {
  Low: "bg-green-500/10 text-green-500 border-green-500/20",
  Medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  High: "bg-red-500/10 text-red-500 border-red-500/20",
}

const statusColumns = [
  { id: "todo", title: "To Do", color: "from-gray-500/20" },
  { id: "in-progress", title: "In Progress", color: "from-blue-500/20" },
  { id: "completed", title: "Done", color: "from-green-500/20" },
]

export function DragDropTasks({ tasks: propTasks, onTaskUpdate }: DragDropTasksProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [addingToColumn, setAddingToColumn] = useState<string | null>(null)
  const [newTaskDescription, setNewTaskDescription] = useState("")
  const [newTaskPriority, setNewTaskPriority] = useState<"Low" | "Medium" | "High">("Medium")
  const { user, isLocalMode } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (propTasks) {
      setTasks(propTasks)
    } else if (user && !isLocalMode) {
      fetchTasks()
    }
  }, [propTasks, user, isLocalMode])

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

  const updateTaskStatus = async (taskId: string, newStatus: string, newIsComplete: boolean) => {
    try {
      if (isLocalMode) {
        await fetch(`/api/local/tasks/${taskId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: newStatus,
            is_complete: newIsComplete,
          }),
        })
      } else {
        const { error } = await supabase
          .from("tasks")
          .update({
            status: newStatus,
            is_complete: newIsComplete,
          })
          .eq("id", taskId)

        if (error) throw error
      }

      setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus as any, is_complete: newIsComplete } : task)))

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

  const handleDeleteTask = async (taskId: string) => {
    try {
      if (isLocalMode) {
        await fetch(`/api/local/tasks/${taskId}`, { method: "DELETE" })
      } else {
        const { error } = await supabase.from("tasks").delete().eq("id", taskId)
        if (error) throw error
      }

      setTasks(tasks.filter((task) => task.id !== taskId))
      toast({ title: "Success", description: "Task deleted successfully" })
    } catch (error: any) {
      console.error("Error deleting task:", error)
      toast({ title: "Error", description: "Failed to delete task", variant: "destructive" })
    }
  }

  const handleAddTask = async (status: string) => {
    if (!newTaskDescription.trim()) return

    try {
      if (isLocalMode) {
        const response = await fetch("/api/local/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: newTaskDescription,
            priority: newTaskPriority,
            status: status,
            is_complete: status === "completed",
            due_date: null,
            context: null,
            tags: [],
          }),
        })
        const { task } = await response.json()
        setTasks([task, ...tasks])
      } else {
        const { data, error } = await supabase
          .from("tasks")
          .insert({
            description: newTaskDescription,
            priority: newTaskPriority,
            status: status,
            is_complete: status === "completed",
            user_id: user?.id,
          })
          .select()
          .single()

        if (error) throw error
        setTasks([data, ...tasks])
      }

      setNewTaskDescription("")
      setNewTaskPriority("Medium")
      setAddingToColumn(null)
      setIsAddDialogOpen(false)

      if (onTaskUpdate) {
        onTaskUpdate()
      }

      toast({ title: "Success", description: "Task added successfully" })
    } catch (error: any) {
      console.error("Error adding task:", error)
      toast({ title: "Error", description: "Failed to add task", variant: "destructive" })
    }
  }

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return
    }

    const newStatus = destination.droppableId
    const newIsComplete = newStatus === "completed"
    updateTaskStatus(draggableId, newStatus, newIsComplete)
  }

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statusColumns.map((column) => (
          <div key={column.id} className="flex flex-col">
            <div
              className={`bg-gradient-to-br ${column.color} to-transparent p-[1px] rounded-xl mb-4`}
            >
              <Card className="glass-card border-white/10 bg-black/40 backdrop-blur-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-lg font-semibold">
                    <span className="text-white">{column.title}</span>
                    <Badge
                      variant="secondary"
                      className="bg-white/10 text-white border-white/20"
                    >
                      {getTasksByStatus(column.id).length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-1 min-h-[400px] rounded-xl p-2 transition-colors ${
                    snapshot.isDraggingOver ? "bg-white/5" : "bg-white/5/30"
                  }`}
                >
                  <div className="space-y-3">
                    {getTasksByStatus(column.id).map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`glass-card border-white/10 p-4 rounded-lg transition-all group ${
                              snapshot.isDragging
                                ? "shadow-xl shadow-primary/20 scale-[1.02] rotate-1"
                                : "hover:bg-white/5"
                            }`}
                          >
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-medium text-sm text-white/90 leading-relaxed flex-1">
                                  {task.description}
                                </p>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500 hover:bg-red-500/10 h-6 w-6 shrink-0"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>

                              {task.context && (
                                <p className="text-xs text-muted-foreground/70 line-clamp-2">
                                  {task.context}
                                </p>
                              )}

                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                <Badge
                                  variant="outline"
                                  className={`font-medium text-xs ${priorityColors[task.priority]}`}
                                >
                                  {task.priority}
                                </Badge>

                                {task.due_date && (
                                  <div
                                    className={`flex items-center gap-1 text-xs ${
                                      new Date(task.due_date) < new Date() && !task.is_complete
                                        ? "text-red-400"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    <Calendar className="h-3 w-3" />
                                    <span>
                                      {new Date(task.due_date).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {task.tags && task.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-1">
                                  {task.tags.slice(0, 3).map((tag, i) => (
                                    <Badge
                                      key={i}
                                      variant="secondary"
                                      className="text-[10px] px-1.5 py-0.5 bg-white/5 text-white/60"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                  {task.tags.length > 3 && (
                                    <Badge
                                      variant="secondary"
                                      className="text-[10px] px-1.5 py-0.5 bg-white/5 text-white/60"
                                    >
                                      +{task.tags.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>

                  {getTasksByStatus(column.id).length === 0 && !snapshot.isDraggingOver && (
                    <div className="flex flex-col items-center justify-center h-[200px] text-center border-2 border-dashed border-white/10 rounded-lg">
                      <p className="text-muted-foreground text-sm mb-3">
                        No tasks in {column.title.toLowerCase()}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setAddingToColumn(column.id)
                          setIsAddDialogOpen(true)
                        }}
                        className="text-muted-foreground hover:text-white hover:bg-white/10"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add task
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Droppable>

            <Button
              variant="ghost"
              className="mt-3 w-full justify-start text-muted-foreground hover:text-white hover:bg-white/10 border border-dashed border-white/10"
              onClick={() => {
                setAddingToColumn(column.id)
                setIsAddDialogOpen(true)
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add task
            </Button>
          </div>
        ))}
      </div>

      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity ${
          isAddDialogOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => {
          setIsAddDialogOpen(false)
          setAddingToColumn(null)
          setNewTaskDescription("")
        }}
      >
        <div
          className="glass-card border-white/20 p-6 rounded-xl w-full max-w-md mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-semibold text-white mb-4">Add New Task</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Description</label>
              <textarea
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Priority</label>
              <div className="flex gap-2">
                {(["Low", "Medium", "High"] as const).map((p) => (
                  <Button
                    key={p}
                    variant={newTaskPriority === p ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewTaskPriority(p)}
                    className={
                      newTaskPriority === p
                        ? ""
                        : "border-white/10 hover:bg-white/10 text-muted-foreground"
                    }
                  >
                    {p}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsAddDialogOpen(false)
                  setAddingToColumn(null)
                  setNewTaskDescription("")
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleAddTask(addingToColumn || "todo")}
                className="flex-1"
                disabled={!newTaskDescription.trim()}
              >
                Add Task
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DragDropContext>
  )
}
