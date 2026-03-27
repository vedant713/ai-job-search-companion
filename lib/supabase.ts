import { createClient, SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const useSupabase = process.env.NEXT_PUBLIC_USE_SUPABASE === "true"
const isConfigured = useSupabase && supabaseUrl.startsWith("https://") && supabaseAnonKey.length > 0

function createDummyClient(): SupabaseClient {
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: async () => ({ data: { session: null, user: null }, error: { message: "Local mode" } }),
      signUp: async () => ({ data: { session: null, user: null }, error: { message: "Local mode" } }),
      signOut: async () => ({ error: null }),
      refreshAccessToken: async () => ({ data: { session: null }, error: null }),
    },
    from: () => ({
      select: () => ({ data: null, error: { message: "Local mode" }, eq: () => ({ data: null, error: null }) }),
      insert: () => ({ data: null, error: { message: "Local mode" }, select: () => ({ data: null, error: null, single: () => ({ data: null, error: null }) }) }),
      update: () => ({ data: null, error: { message: "Local mode" }, eq: () => ({ data: null, error: null }), select: () => ({ data: null, error: null, single: () => ({ data: null, error: null }) }) }),
      delete: () => ({ data: null, error: { message: "Local mode" }, eq: () => ({ data: null, error: null }) }),
    }),
    channel: () => ({
      on: () => ({ subscribe: () => ({}) }),
      subscribe: () => ({}),
      unsubscribe: () => {},
    }),
  } as unknown as SupabaseClient
}

export const supabase: SupabaseClient = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createDummyClient()

export { isConfigured }

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
          status: "Applied" | "Interviewing" | "Offer" | "Rejected" | "Saved"
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
          status?: "Applied" | "Interviewing" | "Offer" | "Rejected" | "Saved"
          notes?: string | null
          job_url?: string | null
          salary_range?: string | null
          location?: string | null
        }
        Update: {
          company?: string
          role?: string
          status?: "Applied" | "Interviewing" | "Offer" | "Rejected" | "Saved"
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
export type ApplicationInsert = Database["public"]["Tables"]["applications"]["Insert"]
export type ApplicationUpdate = Database["public"]["Tables"]["applications"]["Update"]
export type Skill = Database["public"]["Tables"]["skills"]["Row"]
export type Task = Database["public"]["Tables"]["tasks"]["Row"]
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Notification = Database["public"]["Tables"]["notifications"]["Row"]
