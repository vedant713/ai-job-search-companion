export interface User {
  id: number
  name: string
  email: string
  createdAt: string
  updatedAt: string
}

export interface Application {
  id: number
  userId: number
  company: string
  role: string
  status: "Applied" | "Interviewing" | "Offer" | "Rejected"
  dateApplied: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Skill {
  id: number
  userId: number
  skillName: string
  proficiency: number
  targetProficiency?: number
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: number
  userId: number
  description: string
  dueDate?: string
  isComplete: boolean
  priority: "Low" | "Medium" | "High"
  tags: string[]
  context?: string
  createdAt: string
  updatedAt: string
}

export interface AIQuery {
  id: number
  userId: number
  queryText: string
  responseText: string
  context?: string
  timestamp: string
}

export interface ChatMessage {
  id: number
  role: "user" | "assistant"
  content: string
  timestamp: Date
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
