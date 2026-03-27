"use client"

import { useState, useCallback, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import type { Application, Skill, Task, DashboardStats } from "@/lib/types"

const LOCAL_API_BASE = "/api/local"

export function useApi() {
  const { user, isLocalMode } = useAuth()
  const [loading, setLoading] = useState(false)
  const [localMode, setLocalMode] = useState(false)

  useEffect(() => {
    setLocalMode(isLocalMode)
  }, [isLocalMode])

  const fetchApplications = useCallback(async (): Promise<Application[]> => {
    if (localMode) {
      setLoading(true)
      try {
        const response = await fetch(`${LOCAL_API_BASE}/applications`)
        if (response.ok) {
          const data = await response.json()
          return data.applications || []
        }
        return []
      } catch (error) {
        console.error("Error fetching applications from local API:", error)
        return []
      } finally {
        setLoading(false)
      }
    }

    if (!user) return []

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", user.id)
        .order("date_applied", { ascending: false })

      if (error) {
        console.error("Error fetching applications:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error fetching applications:", error)
      return []
    } finally {
      setLoading(false)
    }
  }, [user, localMode])

  const addApplication = useCallback(
    async (
      application: Omit<Application, "id" | "user_id" | "created_at" | "updated_at">,
    ): Promise<Application | null> => {
      if (localMode) {
        setLoading(true)
        try {
          const response = await fetch(`${LOCAL_API_BASE}/applications`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(application),
          })
          if (response.ok) {
            const data = await response.json()
            return data.application
          }
          return null
        } catch (error) {
          console.error("Error adding application via local API:", error)
          return null
        } finally {
          setLoading(false)
        }
      }

      if (!user) return null

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("applications")
          .insert([
            {
              ...application,
              user_id: user.id,
            },
          ])
          .select()
          .single()

        if (error) {
          console.error("Error adding application:", error)
          return null
        }

        return data
      } catch (error) {
        console.error("Error adding application:", error)
        return null
      } finally {
        setLoading(false)
      }
    },
    [user, localMode],
  )

  const updateApplication = useCallback(
    async (id: string, updates: Partial<Application>): Promise<Application | null> => {
      if (localMode) {
        setLoading(true)
        try {
          const response = await fetch(`${LOCAL_API_BASE}/applications/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          })
          if (response.ok) {
            const data = await response.json()
            return data.application
          }
          return null
        } catch (error) {
          console.error("Error updating application via local API:", error)
          return null
        } finally {
          setLoading(false)
        }
      }

      if (!user) return null

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("applications")
          .update(updates)
          .eq("id", id)
          .eq("user_id", user.id)
          .select()
          .single()

        if (error) {
          console.error("Error updating application:", error)
          return null
        }

        return data
      } catch (error) {
        console.error("Error updating application:", error)
        return null
      } finally {
        setLoading(false)
      }
    },
    [user, localMode],
  )

  const deleteApplication = useCallback(
    async (id: string): Promise<boolean> => {
      if (localMode) {
        setLoading(true)
        try {
          const response = await fetch(`${LOCAL_API_BASE}/applications/${id}`, {
            method: "DELETE",
          })
          return response.ok
        } catch (error) {
          console.error("Error deleting application via local API:", error)
          return false
        } finally {
          setLoading(false)
        }
      }

      if (!user) return false

      try {
        setLoading(true)
        const { error } = await supabase.from("applications").delete().eq("id", id).eq("user_id", user.id)

        if (error) {
          console.error("Error deleting application:", error)
          return false
        }

        return true
      } catch (error) {
        console.error("Error deleting application:", error)
        return false
      } finally {
        setLoading(false)
      }
    },
    [user, localMode],
  )

  const fetchSkills = useCallback(async (): Promise<Skill[]> => {
    if (localMode) {
      setLoading(true)
      try {
        const response = await fetch(`${LOCAL_API_BASE}/skills`)
        if (response.ok) {
          const data = await response.json()
          return data.skills || []
        }
        return []
      } catch (error) {
        console.error("Error fetching skills from local API:", error)
        return []
      } finally {
        setLoading(false)
      }
    }

    if (!user) return []

    try {
      setLoading(true)
      const { data, error } = await supabase.from("skills").select("*").eq("user_id", user.id).order("skill_name")

      if (error) {
        console.error("Error fetching skills:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error fetching skills:", error)
      return []
    } finally {
      setLoading(false)
    }
  }, [user, localMode])

  const addSkill = useCallback(
    async (skill: Omit<Skill, "id" | "user_id" | "created_at" | "updated_at">): Promise<Skill | null> => {
      if (localMode) {
        setLoading(true)
        try {
          const response = await fetch(`${LOCAL_API_BASE}/skills`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(skill),
          })
          if (response.ok) {
            const data = await response.json()
            return data.skill
          }
          return null
        } catch (error) {
          console.error("Error adding skill via local API:", error)
          return null
        } finally {
          setLoading(false)
        }
      }

      if (!user) return null

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("skills")
          .insert([
            {
              ...skill,
              user_id: user.id,
            },
          ])
          .select()
          .single()

        if (error) {
          console.error("Error adding skill:", error)
          return null
        }

        return data
      } catch (error) {
        console.error("Error adding skill:", error)
        return null
      } finally {
        setLoading(false)
      }
    },
    [user, localMode],
  )

  const updateSkill = useCallback(
    async (id: string, updates: Partial<Skill>): Promise<Skill | null> => {
      if (localMode) {
        setLoading(true)
        try {
          const response = await fetch(`${LOCAL_API_BASE}/skills/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          })
          if (response.ok) {
            const data = await response.json()
            return data.skill
          }
          return null
        } catch (error) {
          console.error("Error updating skill via local API:", error)
          return null
        } finally {
          setLoading(false)
        }
      }

      if (!user) return null

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("skills")
          .update(updates)
          .eq("id", id)
          .eq("user_id", user.id)
          .select()
          .single()

        if (error) {
          console.error("Error updating skill:", error)
          return null
        }

        return data
      } catch (error) {
        console.error("Error updating skill:", error)
        return null
      } finally {
        setLoading(false)
      }
    },
    [user, localMode],
  )

  const deleteSkill = useCallback(
    async (id: string): Promise<boolean> => {
      if (localMode) {
        setLoading(true)
        try {
          const response = await fetch(`${LOCAL_API_BASE}/skills/${id}`, {
            method: "DELETE",
          })
          return response.ok
        } catch (error) {
          console.error("Error deleting skill via local API:", error)
          return false
        } finally {
          setLoading(false)
        }
      }

      if (!user) return false

      try {
        setLoading(true)
        const { error } = await supabase.from("skills").delete().eq("id", id).eq("user_id", user.id)

        if (error) {
          console.error("Error deleting skill:", error)
          return false
        }

        return true
      } catch (error) {
        console.error("Error deleting skill:", error)
        return false
      } finally {
        setLoading(false)
      }
    },
    [user, localMode],
  )

  const fetchTasks = useCallback(async (): Promise<Task[]> => {
    if (localMode) {
      setLoading(true)
      try {
        const response = await fetch(`${LOCAL_API_BASE}/tasks`)
        if (response.ok) {
          const data = await response.json()
          return data.tasks || []
        }
        return []
      } catch (error) {
        console.error("Error fetching tasks from local API:", error)
        return []
      } finally {
        setLoading(false)
      }
    }

    if (!user) return []

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching tasks:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error fetching tasks:", error)
      return []
    } finally {
      setLoading(false)
    }
  }, [user, localMode])

  const addTask = useCallback(
    async (task: Omit<Task, "id" | "user_id" | "created_at" | "updated_at">): Promise<Task | null> => {
      if (localMode) {
        setLoading(true)
        try {
          const response = await fetch(`${LOCAL_API_BASE}/tasks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(task),
          })
          if (response.ok) {
            const data = await response.json()
            return data.task
          }
          return null
        } catch (error) {
          console.error("Error adding task via local API:", error)
          return null
        } finally {
          setLoading(false)
        }
      }

      if (!user) return null

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("tasks")
          .insert([
            {
              ...task,
              user_id: user.id,
            },
          ])
          .select()
          .single()

        if (error) {
          console.error("Error adding task:", error)
          return null
        }

        return data
      } catch (error) {
        console.error("Error adding task:", error)
        return null
      } finally {
        setLoading(false)
      }
    },
    [user, localMode],
  )

  const updateTask = useCallback(
    async (id: string, updates: Partial<Task>): Promise<Task | null> => {
      if (localMode) {
        setLoading(true)
        try {
          const response = await fetch(`${LOCAL_API_BASE}/tasks/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          })
          if (response.ok) {
            const data = await response.json()
            return data.task
          }
          return null
        } catch (error) {
          console.error("Error updating task via local API:", error)
          return null
        } finally {
          setLoading(false)
        }
      }

      if (!user) return null

      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("tasks")
          .update(updates)
          .eq("id", id)
          .eq("user_id", user.id)
          .select()
          .single()

        if (error) {
          console.error("Error updating task:", error)
          return null
        }

        return data
      } catch (error) {
        console.error("Error updating task:", error)
        return null
      } finally {
        setLoading(false)
      }
    },
    [user, localMode],
  )

  const deleteTask = useCallback(
    async (id: string): Promise<boolean> => {
      if (localMode) {
        setLoading(true)
        try {
          const response = await fetch(`${LOCAL_API_BASE}/tasks/${id}`, {
            method: "DELETE",
          })
          return response.ok
        } catch (error) {
          console.error("Error deleting task via local API:", error)
          return false
        } finally {
          setLoading(false)
        }
      }

      if (!user) return false

      try {
        setLoading(true)
        const { error } = await supabase.from("tasks").delete().eq("id", id).eq("user_id", user.id)

        if (error) {
          console.error("Error deleting task:", error)
          return false
        }

        return true
      } catch (error) {
        console.error("Error deleting task:", error)
        return false
      } finally {
        setLoading(false)
      }
    },
    [user, localMode],
  )

  const fetchDashboardStats = useCallback(async (): Promise<DashboardStats | null> => {
    if (localMode) {
      try {
        const response = await fetch(`${LOCAL_API_BASE}/stats`)
        if (response.ok) {
          return await response.json()
        }
        return null
      } catch (error) {
        console.error("Error fetching stats from local API:", error)
        return null
      }
    }

    if (!user) return null

    try {
      setLoading(true)

      const { data: applications, error: appsError } = await supabase
        .from("applications")
        .select("status")
        .eq("user_id", user.id)

      if (appsError) {
        console.error("Error fetching dashboard data:", appsError)
        return null
      }

      const { data: tasks, error: tasksError } = await supabase
        .from("tasks")
        .select("is_complete")
        .eq("user_id", user.id)

      if (tasksError) {
        console.error("Error fetching tasks for dashboard:", tasksError)
      }

      const totalApplications = applications?.length || 0
      const appliedCount = applications?.filter((app) => app.status === "Applied").length || 0
      const interviewingCount = applications?.filter((app) => app.status === "Interviewing").length || 0
      const offerCount = applications?.filter((app) => app.status === "Offer").length || 0
      const rejectedCount = applications?.filter((app) => app.status === "Rejected").length || 0

      const totalTasks = tasks?.length || 0
      const completedTasks = tasks?.filter((task) => task.is_complete).length || 0
      const pendingTasks = totalTasks - completedTasks

      return {
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
          total: 0,
          averageLevel: 0,
        },
      } as DashboardStats
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      return null
    } finally {
      setLoading(false)
    }
  }, [user, localMode])

  return {
    loading,
    localMode,
    fetchApplications,
    addApplication,
    updateApplication,
    deleteApplication,
    fetchSkills,
    addSkill,
    updateSkill,
    deleteSkill,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    fetchDashboardStats,
  }
}
