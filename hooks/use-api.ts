"use client"

import { useState, useCallback } from "react"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import type { Application, Skill, Task, DashboardStats } from "@/lib/types"

export function useApi() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  // Applications
  const fetchApplications = useCallback(async (): Promise<Application[]> => {
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
  }, [user])

  const addApplication = useCallback(
    async (
      application: Omit<Application, "id" | "user_id" | "created_at" | "updated_at">,
    ): Promise<Application | null> => {
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
    [user],
  )

  const updateApplication = useCallback(
    async (id: string, updates: Partial<Application>): Promise<Application | null> => {
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
    [user],
  )

  const deleteApplication = useCallback(
    async (id: string): Promise<boolean> => {
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
    [user],
  )

  // Skills
  const fetchSkills = useCallback(async (): Promise<Skill[]> => {
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
  }, [user])

  const addSkill = useCallback(
    async (skill: Omit<Skill, "id" | "user_id" | "created_at" | "updated_at">): Promise<Skill | null> => {
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
    [user],
  )

  const updateSkill = useCallback(
    async (id: string, updates: Partial<Skill>): Promise<Skill | null> => {
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
    [user],
  )

  const deleteSkill = useCallback(
    async (id: string): Promise<boolean> => {
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
    [user],
  )

  // Tasks
  const fetchTasks = useCallback(async (): Promise<Task[]> => {
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
  }, [user])

  const addTask = useCallback(
    async (task: Omit<Task, "id" | "user_id" | "created_at" | "updated_at">): Promise<Task | null> => {
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
    [user],
  )

  const updateTask = useCallback(
    async (id: string, updates: Partial<Task>): Promise<Task | null> => {
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
    [user],
  )

  const deleteTask = useCallback(
    async (id: string): Promise<boolean> => {
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
    [user],
  )

  // Dashboard Stats
  const fetchDashboardStats = useCallback(async (): Promise<DashboardStats | null> => {
    if (!user) return null

    try {
      setLoading(true)

      // Fetch applications stats
      const { data: applications, error: appsError } = await supabase
        .from("applications")
        .select("status")
        .eq("user_id", user.id)

      if (appsError) {
        console.error("Error fetching dashboard data:", appsError)
        return null
      }

      // Fetch tasks stats
      const { data: tasks, error: tasksError } = await supabase
        .from("tasks")
        .select("is_complete")
        .eq("user_id", user.id)

      if (tasksError) {
        console.error("Error fetching tasks for dashboard:", tasksError)
      }

      // Calculate stats
      const totalApplications = applications?.length || 0
      const appliedCount = applications?.filter((app) => app.status === "Applied").length || 0
      const interviewingCount = applications?.filter((app) => app.status === "Interviewing").length || 0
      const offerCount = applications?.filter((app) => app.status === "Offer").length || 0
      const rejectedCount = applications?.filter((app) => app.status === "Rejected").length || 0

      const totalTasks = tasks?.length || 0
      const completedTasks = tasks?.filter((task) => task.is_complete).length || 0
      const pendingTasks = totalTasks - completedTasks

      return {
        totalApplications,
        appliedCount,
        interviewingCount,
        offerCount,
        rejectedCount,
        totalTasks,
        completedTasks,
        pendingTasks,
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      return null
    } finally {
      setLoading(false)
    }
  }, [user])

  return {
    loading,
    // Applications
    fetchApplications,
    addApplication,
    updateApplication,
    deleteApplication,
    // Skills
    fetchSkills,
    addSkill,
    updateSkill,
    deleteSkill,
    // Tasks
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    // Dashboard
    fetchDashboardStats,
  }
}
