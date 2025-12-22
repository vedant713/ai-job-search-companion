import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
        }
        Update: {
          email?: string
          full_name?: string | null
          avatar_url?: string | null
        }
      }
      applications: {
        Row: {
          id: string
          user_id: string
          company: string
          role: string
          status: "Applied" | "Interviewing" | "Offer" | "Rejected"
          date_applied: string
          notes: string | null
          job_url: string | null
          salary_range: string | null
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          company: string
          role: string
          status?: "Applied" | "Interviewing" | "Offer" | "Rejected"
          date_applied?: string
          notes?: string | null
          job_url?: string | null
          salary_range?: string | null
          location?: string | null
        }
        Update: {
          company?: string
          role?: string
          status?: "Applied" | "Interviewing" | "Offer" | "Rejected"
          date_applied?: string
          notes?: string | null
          job_url?: string | null
          salary_range?: string | null
          location?: string | null
        }
      }
      skills: {
        Row: {
          id: string
          user_id: string
          skill_name: string
          proficiency: number
          target_proficiency: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          skill_name: string
          proficiency?: number
          target_proficiency?: number | null
        }
        Update: {
          skill_name?: string
          proficiency?: number
          target_proficiency?: number | null
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          description: string
          due_date: string | null
          is_complete: boolean
          priority: "Low" | "Medium" | "High"
          tags: string[] | null
          context: string | null
          status: "todo" | "in-progress" | "completed"
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          description: string
          due_date?: string | null
          is_complete?: boolean
          priority?: "Low" | "Medium" | "High"
          tags?: string[] | null
          context?: string | null
          status?: "todo" | "in-progress" | "completed"
        }
        Update: {
          description?: string
          due_date?: string | null
          is_complete?: boolean
          priority?: "Low" | "Medium" | "High"
          tags?: string[] | null
          context?: string | null
          status?: "todo" | "in-progress" | "completed"
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: "info" | "success" | "warning" | "error"
          read: boolean
          action_url: string | null
          action_text: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          title: string
          message: string
          type?: "info" | "success" | "warning" | "error"
          read?: boolean
          action_url?: string | null
          action_text?: string | null
        }
        Update: {
          read?: boolean
        }
      }
    }
  }
}

export type Application = Database["public"]["Tables"]["applications"]["Row"]
export type Skill = Database["public"]["Tables"]["skills"]["Row"]
export type Task = Database["public"]["Tables"]["tasks"]["Row"]
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Notification = Database["public"]["Tables"]["notifications"]["Row"]
