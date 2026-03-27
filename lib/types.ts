export interface User {
  id: string
  email: string
  full_name?: string
  created_at: string
  updated_at?: string
}

export interface Application {
  id: string
  user_id: string
  company: string
  role: string
  status: "Applied" | "Interviewing" | "Offer" | "Rejected" | "Saved"
  notes?: string
  job_url?: string
  salary_range?: string
  location?: string
  created_at: string
  updated_at?: string
}

export interface Skill {
  id: string
  user_id: string
  skill_name: string
  proficiency: number
  target_proficiency?: number
  category?: string
  created_at: string
  updated_at?: string
}

export interface Task {
  id: string
  user_id: string
  description: string
  due_date?: string
  is_complete: boolean
  priority: "Low" | "Medium" | "High"
  tags?: string[]
  context?: string
  created_at: string
  updated_at?: string
}

export interface AIQuery {
  id: string
  user_id: string
  query_text: string
  response_text: string
  context?: string
  created_at: string
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  created_at: string
}

export interface SkillGap {
  skill: string
  current: number
  target: number
  gap: number
  priority: "High" | "Medium" | "Low"
}

export interface ApplicationStats {
  total: number
  applied: number
  interviewing: number
  offers: number
  rejected: number
  responseRate: number
}

export interface DashboardStats {
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

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginationParams {
  page: number
  limit: number
  total: number
  totalPages: number
}
