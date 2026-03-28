import {
  User,
  Application,
  Skill,
  Task,
  AIQuery,
  ChatMessage,
  SkillGap,
  ApplicationStats,
  DashboardStats,
  PaginationMeta,
  PaginationParams,
} from "./types"

const VALID_APPLICATION_STATUSES = ["Applied", "Interviewing", "Offer", "Rejected", "Saved"] as const
const VALID_PRIORITIES = ["Low", "Medium", "High"] as const
const VALID_CHAT_ROLES = ["user", "assistant"] as const

export function isUser(obj: unknown): obj is User {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as User).id === "string" &&
    typeof (obj as User).email === "string" &&
    typeof (obj as User).created_at === "string" &&
    ((obj as User).full_name === undefined || typeof (obj as User).full_name === "string") &&
    ((obj as User).updated_at === undefined || typeof (obj as User).updated_at === "string")
  )
}

export function isApplication(obj: unknown): obj is Application {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as Application).id === "string" &&
    typeof (obj as Application).user_id === "string" &&
    typeof (obj as Application).company === "string" &&
    typeof (obj as Application).role === "string" &&
    VALID_APPLICATION_STATUSES.includes((obj as Application).status as any) &&
    typeof (obj as Application).created_at === "string" &&
    ((obj as Application).notes === undefined || typeof (obj as Application).notes === "string") &&
    ((obj as Application).job_url === undefined || typeof (obj as Application).job_url === "string") &&
    ((obj as Application).salary_range === undefined || typeof (obj as Application).salary_range === "string") &&
    ((obj as Application).location === undefined || typeof (obj as Application).location === "string") &&
    ((obj as Application).updated_at === undefined || typeof (obj as Application).updated_at === "string")
  )
}

export function isSkill(obj: unknown): obj is Skill {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as Skill).id === "string" &&
    typeof (obj as Skill).user_id === "string" &&
    typeof (obj as Skill).skill_name === "string" &&
    typeof (obj as Skill).proficiency === "number" &&
    typeof (obj as Skill).created_at === "string" &&
    ((obj as Skill).target_proficiency === undefined || typeof (obj as Skill).target_proficiency === "number") &&
    ((obj as Skill).category === undefined || typeof (obj as Skill).category === "string") &&
    ((obj as Skill).updated_at === undefined || typeof (obj as Skill).updated_at === "string")
  )
}

export function isTask(obj: unknown): obj is Task {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as Task).id === "string" &&
    typeof (obj as Task).user_id === "string" &&
    typeof (obj as Task).description === "string" &&
    typeof (obj as Task).is_complete === "boolean" &&
    VALID_PRIORITIES.includes((obj as Task).priority as any) &&
    typeof (obj as Task).created_at === "string" &&
    ((obj as Task).due_date === undefined || typeof (obj as Task).due_date === "string") &&
    ((obj as Task).tags === undefined || Array.isArray((obj as Task).tags)) &&
    ((obj as Task).context === undefined || typeof (obj as Task).context === "string") &&
    ((obj as Task).updated_at === undefined || typeof (obj as Task).updated_at === "string")
  )
}

export function isAIQuery(obj: unknown): obj is AIQuery {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as AIQuery).id === "string" &&
    typeof (obj as AIQuery).user_id === "string" &&
    typeof (obj as AIQuery).query_text === "string" &&
    typeof (obj as AIQuery).response_text === "string" &&
    typeof (obj as AIQuery).created_at === "string" &&
    ((obj as AIQuery).context === undefined || typeof (obj as AIQuery).context === "string")
  )
}

export function isChatMessage(obj: unknown): obj is ChatMessage {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as ChatMessage).id === "string" &&
    VALID_CHAT_ROLES.includes((obj as ChatMessage).role as any) &&
    typeof (obj as ChatMessage).content === "string" &&
    typeof (obj as ChatMessage).created_at === "string"
  )
}

export function isSkillGap(obj: unknown): obj is SkillGap {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as SkillGap).skill === "string" &&
    typeof (obj as SkillGap).current === "number" &&
    typeof (obj as SkillGap).target === "number" &&
    typeof (obj as SkillGap).gap === "number" &&
    VALID_PRIORITIES.includes((obj as SkillGap).priority as any)
  )
}

export function isApplicationStats(obj: unknown): obj is ApplicationStats {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as ApplicationStats).total === "number" &&
    typeof (obj as ApplicationStats).applied === "number" &&
    typeof (obj as ApplicationStats).interviewing === "number" &&
    typeof (obj as ApplicationStats).offers === "number" &&
    typeof (obj as ApplicationStats).rejected === "number" &&
    typeof (obj as ApplicationStats).responseRate === "number"
  )
}

export function isDashboardStats(obj: unknown): obj is DashboardStats {
  if (typeof obj !== "object" || obj === null) return false
  const stats = obj as DashboardStats
  return (
    typeof stats.applications === "object" &&
    stats.applications !== null &&
    typeof stats.applications.total === "number" &&
    typeof stats.applications.applied === "number" &&
    typeof stats.applications.interviewing === "number" &&
    typeof stats.applications.offers === "number" &&
    typeof stats.applications.rejected === "number" &&
    typeof stats.applications.responseRate === "number" &&
    typeof stats.applications.thisWeek === "number" &&
    typeof stats.tasks === "object" &&
    stats.tasks !== null &&
    typeof stats.tasks.total === "number" &&
    typeof stats.tasks.completed === "number" &&
    typeof stats.tasks.pending === "number" &&
    typeof stats.skills === "object" &&
    stats.skills !== null &&
    typeof stats.skills.total === "number" &&
    typeof stats.skills.averageLevel === "number"
  )
}

export function isPaginationMeta(obj: unknown): obj is PaginationMeta {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as PaginationMeta).page === "number" &&
    typeof (obj as PaginationMeta).limit === "number" &&
    typeof (obj as PaginationMeta).total === "number" &&
    typeof (obj as PaginationMeta).totalPages === "number"
  )
}

export function isPaginationParams(obj: unknown): obj is PaginationParams {
  return isPaginationMeta(obj)
}

export function isValidApplicationStatus(status: string): status is Application["status"] {
  return VALID_APPLICATION_STATUSES.includes(status as any)
}

export function isValidPriority(priority: string): priority is Task["priority"] {
  return VALID_PRIORITIES.includes(priority as any)
}

export function isValidChatRole(role: string): role is ChatMessage["role"] {
  return VALID_CHAT_ROLES.includes(role as any)
}

export function validateUser(user: User): string[] {
  const errors: string[] = []
  if (!user.id) errors.push("id is required")
  if (!user.email) errors.push("email is required")
  if (!user.created_at) errors.push("created_at is required")
  return errors
}

export function validateApplication(app: Application): string[] {
  const errors: string[] = []
  if (!app.id) errors.push("id is required")
  if (!app.user_id) errors.push("user_id is required")
  if (!app.company) errors.push("company is required")
  if (!app.role) errors.push("role is required")
  if (!app.status) errors.push("status is required")
  else if (!isValidApplicationStatus(app.status)) errors.push(`invalid status: ${app.status}`)
  if (!app.created_at) errors.push("created_at is required")
  return errors
}

export function validateSkill(skill: Skill): string[] {
  const errors: string[] = []
  if (!skill.id) errors.push("id is required")
  if (!skill.user_id) errors.push("user_id is required")
  if (!skill.skill_name) errors.push("skill_name is required")
  if (typeof skill.proficiency !== "number") errors.push("proficiency must be a number")
  if (!skill.created_at) errors.push("created_at is required")
  return errors
}

export function validateTask(task: Task): string[] {
  const errors: string[] = []
  if (!task.id) errors.push("id is required")
  if (!task.user_id) errors.push("user_id is required")
  if (!task.description) errors.push("description is required")
  if (typeof task.is_complete !== "boolean") errors.push("is_complete must be a boolean")
  if (!task.priority) errors.push("priority is required")
  else if (!isValidPriority(task.priority)) errors.push(`invalid priority: ${task.priority}`)
  if (!task.created_at) errors.push("created_at is required")
  return errors
}

export function validateAIQuery(query: AIQuery): string[] {
  const errors: string[] = []
  if (!query.id) errors.push("id is required")
  if (!query.user_id) errors.push("user_id is required")
  if (!query.query_text) errors.push("query_text is required")
  if (!query.response_text) errors.push("response_text is required")
  if (!query.created_at) errors.push("created_at is required")
  return errors
}

export function validateChatMessage(msg: ChatMessage): string[] {
  const errors: string[] = []
  if (!msg.id) errors.push("id is required")
  if (!msg.role) errors.push("role is required")
  else if (!isValidChatRole(msg.role)) errors.push(`invalid role: ${msg.role}`)
  if (!msg.content) errors.push("content is required")
  if (!msg.created_at) errors.push("created_at is required")
  return errors
}

describe("Type Guards", () => {
  describe("isUser", () => {
    it("should return true for valid User object", () => {
      const user: User = {
        id: "user-1",
        email: "test@example.com",
        full_name: "Test User",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
      }
      expect(isUser(user)).toBe(true)
    })

    it("should return true for User with only required fields", () => {
      const user: User = {
        id: "user-1",
        email: "test@example.com",
        created_at: "2024-01-01T00:00:00Z",
      }
      expect(isUser(user)).toBe(true)
    })

    it("should return false for null", () => {
      expect(isUser(null)).toBe(false)
    })

    it("should return false for non-object", () => {
      expect(isUser("string")).toBe(false)
      expect(isUser(123)).toBe(false)
      expect(isUser(undefined)).toBe(false)
    })

    it("should return false for object missing required fields", () => {
      expect(isUser({ id: "user-1" })).toBe(false)
      expect(isUser({ email: "test@example.com" })).toBe(false)
      expect(isUser({ created_at: "2024-01-01" })).toBe(false)
    })

    it("should return false for object with wrong field types", () => {
      expect(isUser({ id: 1, email: "test@example.com", created_at: "2024-01-01" })).toBe(false)
      expect(isUser({ id: "user-1", email: 123, created_at: "2024-01-01" })).toBe(false)
      expect(isUser({ id: "user-1", email: "test@example.com", created_at: 123 })).toBe(false)
    })

    it("should return false for object with invalid optional field types", () => {
      const user = { id: "user-1", email: "test@example.com", created_at: "2024-01-01", full_name: 123 }
      expect(isUser(user)).toBe(false)
    })
  })

  describe("isApplication", () => {
    it("should return true for valid Application object", () => {
      const app: Application = {
        id: "app-1",
        user_id: "user-1",
        company: "Tech Corp",
        role: "Software Engineer",
        status: "Applied",
        notes: "Some notes",
        job_url: "https://example.com/job",
        salary_range: "$100k-$150k",
        location: "Remote",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
      }
      expect(isApplication(app)).toBe(true)
    })

    it("should return true for Application with only required fields", () => {
      const app: Application = {
        id: "app-1",
        user_id: "user-1",
        company: "Tech Corp",
        role: "Software Engineer",
        status: "Applied",
        created_at: "2024-01-01T00:00:00Z",
      }
      expect(isApplication(app)).toBe(true)
    })

    it("should return false for object missing required fields", () => {
      expect(isApplication({ company: "Tech Corp" })).toBe(false)
      expect(isApplication({ id: "app-1" })).toBe(false)
    })

    it("should return false for invalid status", () => {
      const app = {
        id: "app-1",
        user_id: "user-1",
        company: "Tech Corp",
        role: "Engineer",
        status: "InvalidStatus",
        created_at: "2024-01-01",
      }
      expect(isApplication(app)).toBe(false)
    })

    it("should validate all valid statuses", () => {
      const statuses: Application["status"][] = ["Applied", "Interviewing", "Offer", "Rejected", "Saved"]
      statuses.forEach((status) => {
        const app: Application = {
          id: "app-1",
          user_id: "user-1",
          company: "Tech Corp",
          role: "Engineer",
          status,
          created_at: "2024-01-01",
        }
        expect(isApplication(app)).toBe(true)
      })
    })
  })

  describe("isSkill", () => {
    it("should return true for valid Skill object", () => {
      const skill: Skill = {
        id: "skill-1",
        user_id: "user-1",
        skill_name: "TypeScript",
        proficiency: 7,
        target_proficiency: 10,
        category: "Programming",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
      }
      expect(isSkill(skill)).toBe(true)
    })

    it("should return true for Skill with only required fields", () => {
      const skill: Skill = {
        id: "skill-1",
        user_id: "user-1",
        skill_name: "TypeScript",
        proficiency: 7,
        created_at: "2024-01-01T00:00:00Z",
      }
      expect(isSkill(skill)).toBe(true)
    })

    it("should return false for object missing required fields", () => {
      expect(isSkill({ id: "skill-1" })).toBe(false)
      expect(isSkill({ skill_name: "TypeScript" })).toBe(false)
    })

    it("should return false for wrong proficiency type", () => {
      const skill = {
        id: "skill-1",
        user_id: "user-1",
        skill_name: "TypeScript",
        proficiency: "7",
        created_at: "2024-01-01",
      }
      expect(isSkill(skill)).toBe(false)
    })
  })

  describe("isTask", () => {
    it("should return true for valid Task object", () => {
      const task: Task = {
        id: "task-1",
        user_id: "user-1",
        description: "Complete project",
        due_date: "2024-01-15",
        is_complete: false,
        priority: "High",
        tags: ["urgent", "work"],
        context: "Office",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-02T00:00:00Z",
      }
      expect(isTask(task)).toBe(true)
    })

    it("should return true for Task with only required fields", () => {
      const task: Task = {
        id: "task-1",
        user_id: "user-1",
        description: "Complete project",
        is_complete: false,
        priority: "Medium",
        created_at: "2024-01-01T00:00:00Z",
      }
      expect(isTask(task)).toBe(true)
    })

    it("should return false for object missing required fields", () => {
      expect(isTask({ id: "task-1" })).toBe(false)
      expect(isTask({ description: "Task" })).toBe(false)
    })

    it("should return false for invalid priority", () => {
      const task = {
        id: "task-1",
        user_id: "user-1",
        description: "Task",
        is_complete: false,
        priority: "Invalid",
        created_at: "2024-01-01",
      }
      expect(isTask(task)).toBe(false)
    })

    it("should validate all valid priorities", () => {
      const priorities: Task["priority"][] = ["Low", "Medium", "High"]
      priorities.forEach((priority) => {
        const task: Task = {
          id: "task-1",
          user_id: "user-1",
          description: "Task",
          is_complete: false,
          priority,
          created_at: "2024-01-01",
        }
        expect(isTask(task)).toBe(true)
      })
    })

    it("should accept tags as array", () => {
      const task: Task = {
        id: "task-1",
        user_id: "user-1",
        description: "Task",
        is_complete: false,
        priority: "High",
        tags: ["tag1", "tag2", "tag3"],
        created_at: "2024-01-01",
      }
      expect(isTask(task)).toBe(true)
    })

    it("should reject non-array tags", () => {
      const task = {
        id: "task-1",
        user_id: "user-1",
        description: "Task",
        is_complete: false,
        priority: "High",
        tags: "not-an-array",
        created_at: "2024-01-01",
      }
      expect(isTask(task)).toBe(false)
    })
  })

  describe("isAIQuery", () => {
    it("should return true for valid AIQuery object", () => {
      const query: AIQuery = {
        id: "query-1",
        user_id: "user-1",
        query_text: "How do I prepare for an interview?",
        response_text: "Practice common questions...",
        context: "job_search",
        created_at: "2024-01-01T00:00:00Z",
      }
      expect(isAIQuery(query)).toBe(true)
    })

    it("should return true for AIQuery with only required fields", () => {
      const query: AIQuery = {
        id: "query-1",
        user_id: "user-1",
        query_text: "How do I prepare for an interview?",
        response_text: "Practice common questions...",
        created_at: "2024-01-01T00:00:00Z",
      }
      expect(isAIQuery(query)).toBe(true)
    })

    it("should return false for object missing required fields", () => {
      expect(isAIQuery({ id: "query-1" })).toBe(false)
      expect(isAIQuery({ query_text: "?" })).toBe(false)
    })
  })

  describe("isChatMessage", () => {
    it("should return true for valid ChatMessage object", () => {
      const msg: ChatMessage = {
        id: "msg-1",
        role: "user",
        content: "Hello!",
        created_at: "2024-01-01T00:00:00Z",
      }
      expect(isChatMessage(msg)).toBe(true)
    })

    it("should accept assistant role", () => {
      const msg: ChatMessage = {
        id: "msg-1",
        role: "assistant",
        content: "Hello! How can I help?",
        created_at: "2024-01-01T00:00:00Z",
      }
      expect(isChatMessage(msg)).toBe(true)
    })

    it("should return false for invalid role", () => {
      const msg = {
        id: "msg-1",
        role: "system",
        content: "Hello!",
        created_at: "2024-01-01",
      }
      expect(isChatMessage(msg)).toBe(false)
    })

    it("should return false for object missing required fields", () => {
      expect(isChatMessage({ id: "msg-1" })).toBe(false)
      expect(isChatMessage({ role: "user" })).toBe(false)
    })
  })

  describe("isSkillGap", () => {
    it("should return true for valid SkillGap object", () => {
      const gap: SkillGap = {
        skill: "TypeScript",
        current: 5,
        target: 8,
        gap: 3,
        priority: "High",
      }
      expect(isSkillGap(gap)).toBe(true)
    })

    it("should return false for object missing required fields", () => {
      expect(isSkillGap({ skill: "TypeScript" })).toBe(false)
      expect(isSkillGap({ current: 5, target: 8, gap: 3, priority: "High" })).toBe(false)
    })

    it("should return false for wrong field types", () => {
      const gap = {
        skill: "TypeScript",
        current: "5",
        target: 8,
        gap: 3,
        priority: "High",
      }
      expect(isSkillGap(gap)).toBe(false)
    })
  })

  describe("isApplicationStats", () => {
    it("should return true for valid ApplicationStats object", () => {
      const stats: ApplicationStats = {
        total: 50,
        applied: 30,
        interviewing: 10,
        offers: 5,
        rejected: 5,
        responseRate: 0.2,
      }
      expect(isApplicationStats(stats)).toBe(true)
    })

    it("should return false for object missing required fields", () => {
      expect(isApplicationStats({ total: 50 })).toBe(false)
      expect(isApplicationStats({ applied: 30 })).toBe(false)
    })

    it("should return false for wrong field types", () => {
      const stats = {
        total: "50",
        applied: 30,
        interviewing: 10,
        offers: 5,
        rejected: 5,
        responseRate: 0.2,
      }
      expect(isApplicationStats(stats)).toBe(false)
    })
  })

  describe("isDashboardStats", () => {
    it("should return true for valid DashboardStats object", () => {
      const stats: DashboardStats = {
        applications: {
          total: 50,
          applied: 30,
          interviewing: 10,
          offers: 5,
          rejected: 5,
          responseRate: 0.2,
          thisWeek: 3,
        },
        tasks: {
          total: 20,
          completed: 15,
          pending: 5,
        },
        skills: {
          total: 10,
          averageLevel: 6.5,
        },
      }
      expect(isDashboardStats(stats)).toBe(true)
    })

    it("should return false for nested object with missing fields", () => {
      const stats = {
        applications: { total: 50 },
        tasks: { total: 20 },
        skills: { total: 10 },
      }
      expect(isDashboardStats(stats)).toBe(false)
    })
  })

  describe("isPaginationMeta and isPaginationParams", () => {
    it("should return true for valid PaginationMeta object", () => {
      const meta: PaginationMeta = {
        page: 1,
        limit: 20,
        total: 100,
        totalPages: 5,
      }
      expect(isPaginationMeta(meta)).toBe(true)
      expect(isPaginationParams(meta)).toBe(true)
    })

    it("should return false for object missing required fields", () => {
      expect(isPaginationMeta({ page: 1 })).toBe(false)
      expect(isPaginationParams({ total: 100 })).toBe(false)
    })
  })
})

describe("Enum Validation", () => {
  describe("isValidApplicationStatus", () => {
    it("should return true for all valid statuses", () => {
      VALID_APPLICATION_STATUSES.forEach((status) => {
        expect(isValidApplicationStatus(status)).toBe(true)
      })
    })

    it("should return false for invalid statuses", () => {
      expect(isValidApplicationStatus("applied")).toBe(false)
      expect(isValidApplicationStatus("OFFER")).toBe(false)
      expect(isValidApplicationStatus("Pending")).toBe(false)
      expect(isValidApplicationStatus("")).toBe(false)
      expect(isValidApplicationStatus("Invalid")).toBe(false)
    })
  })

  describe("isValidPriority", () => {
    it("should return true for all valid priorities", () => {
      VALID_PRIORITIES.forEach((priority) => {
        expect(isValidPriority(priority)).toBe(true)
      })
    })

    it("should return false for invalid priorities", () => {
      expect(isValidPriority("low")).toBe(false)
      expect(isValidPriority("HIGH")).toBe(false)
      expect(isValidPriority("Critical")).toBe(false)
      expect(isValidPriority("")).toBe(false)
    })
  })

  describe("isValidChatRole", () => {
    it("should return true for all valid roles", () => {
      VALID_CHAT_ROLES.forEach((role) => {
        expect(isValidChatRole(role)).toBe(true)
      })
    })

    it("should return false for invalid roles", () => {
      expect(isValidChatRole("system")).toBe(false)
      expect(isValidChatRole("admin")).toBe(false)
      expect(isValidChatRole("")).toBe(false)
    })
  })
})

describe("Validation Functions", () => {
  describe("validateUser", () => {
    it("should return empty array for valid user", () => {
      const user: User = {
        id: "user-1",
        email: "test@example.com",
        created_at: "2024-01-01T00:00:00Z",
      }
      expect(validateUser(user)).toEqual([])
    })

    it("should return errors for missing required fields", () => {
      expect(validateUser({} as User)).toContain("id is required")
      expect(validateUser({ id: "user-1" } as User)).toContain("email is required")
      expect(validateUser({ id: "user-1", email: "test@example.com" } as User)).toContain("created_at is required")
    })
  })

  describe("validateApplication", () => {
    it("should return empty array for valid application", () => {
      const app: Application = {
        id: "app-1",
        user_id: "user-1",
        company: "Tech Corp",
        role: "Engineer",
        status: "Applied",
        created_at: "2024-01-01T00:00:00Z",
      }
      expect(validateApplication(app)).toEqual([])
    })

    it("should return errors for missing required fields", () => {
      const errors = validateApplication({} as Application)
      expect(errors).toContain("id is required")
      expect(errors).toContain("user_id is required")
      expect(errors).toContain("company is required")
      expect(errors).toContain("role is required")
      expect(errors).toContain("status is required")
      expect(errors).toContain("created_at is required")
    })

    it("should return error for invalid status", () => {
      const app = {
        id: "app-1",
        user_id: "user-1",
        company: "Tech Corp",
        role: "Engineer",
        status: "InvalidStatus",
        created_at: "2024-01-01",
      }
      const errors = validateApplication(app as Application)
      expect(errors.some((e) => e.includes("invalid status"))).toBe(true)
    })
  })

  describe("validateSkill", () => {
    it("should return empty array for valid skill", () => {
      const skill: Skill = {
        id: "skill-1",
        user_id: "user-1",
        skill_name: "TypeScript",
        proficiency: 7,
        created_at: "2024-01-01T00:00:00Z",
      }
      expect(validateSkill(skill)).toEqual([])
    })

    it("should return error for non-number proficiency", () => {
      const skill = {
        id: "skill-1",
        user_id: "user-1",
        skill_name: "TypeScript",
        proficiency: "7",
        created_at: "2024-01-01",
      }
      expect(validateSkill(skill as unknown as Skill)).toContain("proficiency must be a number")
    })
  })

  describe("validateTask", () => {
    it("should return empty array for valid task", () => {
      const task: Task = {
        id: "task-1",
        user_id: "user-1",
        description: "Complete project",
        is_complete: false,
        priority: "High",
        created_at: "2024-01-01T00:00:00Z",
      }
      expect(validateTask(task)).toEqual([])
    })

    it("should return error for non-boolean is_complete", () => {
      const task = {
        id: "task-1",
        user_id: "user-1",
        description: "Task",
        is_complete: "false",
        priority: "High",
        created_at: "2024-01-01",
      }
      expect(validateTask(task as unknown as Task)).toContain("is_complete must be a boolean")
    })

    it("should return error for invalid priority", () => {
      const task = {
        id: "task-1",
        user_id: "user-1",
        description: "Task",
        is_complete: false,
        priority: "Invalid",
        created_at: "2024-01-01",
      }
      const errors = validateTask(task as Task)
      expect(errors.some((e) => e.includes("invalid priority"))).toBe(true)
    })
  })

  describe("validateAIQuery", () => {
    it("should return empty array for valid AIQuery", () => {
      const query: AIQuery = {
        id: "query-1",
        user_id: "user-1",
        query_text: "Question?",
        response_text: "Answer",
        created_at: "2024-01-01T00:00:00Z",
      }
      expect(validateAIQuery(query)).toEqual([])
    })
  })

  describe("validateChatMessage", () => {
    it("should return empty array for valid ChatMessage", () => {
      const msg: ChatMessage = {
        id: "msg-1",
        role: "user",
        content: "Hello!",
        created_at: "2024-01-01T00:00:00Z",
      }
      expect(validateChatMessage(msg)).toEqual([])
    })

    it("should return error for invalid role", () => {
      const msg = {
        id: "msg-1",
        role: "system",
        content: "Hello!",
        created_at: "2024-01-01",
      }
      const errors = validateChatMessage(msg as ChatMessage)
      expect(errors.some((e) => e.includes("invalid role"))).toBe(true)
    })
  })
})

describe("Interface Compliance", () => {
  it("User interface should accept objects with all properties", () => {
    const user: User = {
      id: "user-1",
      email: "test@example.com",
      full_name: "Test User",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-02T00:00:00Z",
    }
    expect(isUser(user)).toBe(true)
    expect(validateUser(user)).toEqual([])
  })

  it("Application interface should accept all valid status values", () => {
    const statuses: Application["status"][] = ["Applied", "Interviewing", "Offer", "Rejected", "Saved"]
    statuses.forEach((status) => {
      const app: Application = {
        id: "app-1",
        user_id: "user-1",
        company: "Tech Corp",
        role: "Engineer",
        status,
        created_at: "2024-01-01T00:00:00Z",
      }
      expect(isApplication(app)).toBe(true)
    })
  })

  it("Task interface should accept all valid priority values", () => {
    const priorities: Task["priority"][] = ["Low", "Medium", "High"]
    priorities.forEach((priority) => {
      const task: Task = {
        id: "task-1",
        user_id: "user-1",
        description: "Task",
        is_complete: false,
        priority,
        created_at: "2024-01-01T00:00:00Z",
      }
      expect(isTask(task)).toBe(true)
    })
  })

  it("ChatMessage interface should accept both valid roles", () => {
    const roles: ChatMessage["role"][] = ["user", "assistant"]
    roles.forEach((role) => {
      const msg: ChatMessage = {
        id: "msg-1",
        role,
        content: "Hello!",
        created_at: "2024-01-01T00:00:00Z",
      }
      expect(isChatMessage(msg)).toBe(true)
    })
  })

  it("SkillGap interface should calculate gap correctly", () => {
    const gap: SkillGap = {
      skill: "JavaScript",
      current: 6,
      target: 9,
      gap: 3,
      priority: "Medium",
    }
    expect(gap.gap).toBe(gap.target - gap.current)
    expect(isSkillGap(gap)).toBe(true)
  })

  it("PaginationMeta and PaginationParams should have identical shape", () => {
    const meta: PaginationMeta = { page: 1, limit: 10, total: 100, totalPages: 10 }
    const params: PaginationParams = { page: 1, limit: 10, total: 100, totalPages: 10 }
    expect(isPaginationMeta(meta)).toBe(true)
    expect(isPaginationParams(params)).toBe(true)
    expect(isPaginationMeta(params)).toBe(true)
    expect(isPaginationParams(meta)).toBe(true)
  })
})
