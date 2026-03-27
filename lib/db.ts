import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"
import { sql } from "drizzle-orm"

const sqlite = new Database("local.db")

export const db = drizzle(sqlite)

export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  full_name: text("full_name"),
  avatar_url: text("avatar_url"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at"),
})

export const applications = sqliteTable("applications", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  company: text("company").notNull(),
  role: text("role").notNull(),
  status: text("status")
    .$type<"Applied" | "Interviewing" | "Offer" | "Rejected" | "Saved">()
    .notNull()
    .default("Applied"),
  date_applied: text("date_applied"),
  notes: text("notes"),
  job_url: text("job_url"),
  salary_range: text("salary_range"),
  location: text("location"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at"),
})

export const skills = sqliteTable("skills", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  skill_name: text("skill_name").notNull(),
  proficiency: integer("proficiency").notNull().default(0),
  target_proficiency: integer("target_proficiency"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at"),
})

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  description: text("description").notNull(),
  due_date: text("due_date"),
  is_complete: integer("is_complete", { mode: "boolean" }).notNull().default(false),
  priority: text("priority")
    .$type<"Low" | "Medium" | "High">()
    .notNull()
    .default("Medium"),
  tags: text("tags"),
  context: text("context"),
  status: text("status"),
  created_at: text("created_at").notNull(),
  updated_at: text("updated_at"),
})

export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("info"),
  read: integer("read", { mode: "boolean" }).notNull().default(false),
  action_url: text("action_url"),
  action_text: text("action_text"),
  created_at: text("created_at").notNull(),
})

export type Profile = Omit<typeof profiles.$inferSelect, "created_at" | "updated_at" | "full_name" | "avatar_url"> & {
  created_at: string
  updated_at?: string
  full_name?: string
  avatar_url?: string
}

export type NewProfile = typeof profiles.$inferInsert

export type Application = Omit<typeof applications.$inferSelect, "date_applied" | "notes" | "job_url" | "salary_range" | "location" | "updated_at"> & {
  date_applied?: string
  notes?: string
  job_url?: string
  salary_range?: string
  location?: string
  updated_at?: string
}

export type NewApplication = typeof applications.$inferInsert

export type Skill = Omit<typeof skills.$inferSelect, "target_proficiency" | "updated_at"> & {
  target_proficiency?: number
  updated_at?: string
}

export type NewSkill = typeof skills.$inferInsert

export type Task = Omit<typeof tasks.$inferSelect, "due_date" | "tags" | "context" | "status" | "updated_at"> & {
  due_date?: string
  tags?: string[]
  context?: string
  status?: string
  updated_at?: string
}

export type NewTask = typeof tasks.$inferInsert

export type Notification = typeof notifications.$inferSelect
export type NewNotification = typeof notifications.$inferInsert
