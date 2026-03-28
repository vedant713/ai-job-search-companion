import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import { eq, desc } from "drizzle-orm"
import { v4 as uuidv4 } from "uuid"
import {
  db,
  profiles,
  applications,
  skills,
  tasks,
  notifications,
  type Profile,
  type Application,
  type Skill,
  type Task,
  type Notification,
} from "./db"

const LOCAL_USER_ID = "local-user-id"
const DB_PATH = "./local.db"

let dbInstance: Database.Database | null = null

function getDb(): Database.Database {
  if (!dbInstance) {
    dbInstance = new Database(DB_PATH)
  }
  return dbInstance
}

export async function initializeLocalDb(): Promise<void> {
  const sqlite = getDb()

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      full_name TEXT,
      avatar_url TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      company TEXT NOT NULL,
      role TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Applied',
      date_applied TEXT,
      notes TEXT,
      job_url TEXT,
      salary_range TEXT,
      location TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS skills (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      skill_name TEXT NOT NULL,
      proficiency INTEGER NOT NULL DEFAULT 0,
      target_proficiency INTEGER,
      created_at TEXT NOT NULL,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      description TEXT NOT NULL,
      due_date TEXT,
      is_complete INTEGER NOT NULL DEFAULT 0,
      priority TEXT NOT NULL DEFAULT 'Medium',
      tags TEXT,
      context TEXT,
      status TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'info',
      read INTEGER NOT NULL DEFAULT 0,
      action_url TEXT,
      action_text TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS local_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `)

  const seeded = sqlite.prepare("SELECT value FROM local_settings WHERE key = ?").get(LOCAL_USER_ID + "-seeded")

  if (!seeded) {
    await seedData(sqlite)
    sqlite.prepare("INSERT INTO local_settings (key, value) VALUES (?, ?)").run(LOCAL_USER_ID + "-seeded", "true")
  }
}

async function seedData(sqlite: Database.Database): Promise<void> {
  const now = new Date().toISOString()
  const profileId = LOCAL_USER_ID

  sqlite.prepare(`
    INSERT INTO profiles (id, email, full_name, avatar_url, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(profileId, "local@user.com", "Local User", null, now, now)

  const apps = [
    [uuidv4(), profileId, "Tech Corp", "Frontend Developer", "Interviewing", 
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      "Great culture, remote-friendly", "https://example.com/job/1", "$120k - $150k", "Remote", now, now],
    [uuidv4(), profileId, "StartupXYZ", "Full Stack Engineer", "Applied",
      new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      "AI-focused company", "https://example.com/job/2", "$100k - $130k", "San Francisco, CA", now, now],
    [uuidv4(), profileId, "BigTech Inc", "Senior Software Engineer", "Saved",
      null, "Need to apply", "https://example.com/job/3", "$180k - $220k", "New York, NY", now, now],
  ]
  
  const insertApp = sqlite.prepare(`
    INSERT INTO applications (id, user_id, company, role, status, date_applied, notes, job_url, salary_range, location, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  for (const app of apps) {
    insertApp.run(...app)
  }

  const skillsData = [
    [uuidv4(), profileId, "TypeScript", 8, 10, now, now],
    [uuidv4(), profileId, "React", 7, 9, now, now],
    [uuidv4(), profileId, "Node.js", 6, 8, now, now],
    [uuidv4(), profileId, "Python", 5, 8, now, now],
  ]
  
  const insertSkill = sqlite.prepare(`
    INSERT INTO skills (id, user_id, skill_name, proficiency, target_proficiency, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  for (const skill of skillsData) {
    insertSkill.run(...skill)
  }

  const tasksData = [
    [uuidv4(), profileId, "Update resume with new projects", 
      new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), 
      0, "High", JSON.stringify(["resume", "job-search"]), "Make it more ATS-friendly", "pending", now, now],
    [uuidv4(), profileId, "Practice behavioral interview questions",
      new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      0, "Medium", JSON.stringify(["interview", "prep"]), "STAR method", "pending", now, now],
    [uuidv4(), profileId, "Complete take-home assignment for Tech Corp",
      new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      0, "High", JSON.stringify(["interview", "tech-corp"]), "Build a simple React component", "in-progress", now, now],
  ]
  
  const insertTask = sqlite.prepare(`
    INSERT INTO tasks (id, user_id, description, due_date, is_complete, priority, tags, context, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  for (const task of tasksData) {
    insertTask.run(...task)
  }

  const notifs = [
    [uuidv4(), profileId, "Welcome to AI Job Search Companion!", 
      "Your local database is ready. Start tracking your job search today.", 
      "info", 0, "/dashboard", "Go to Dashboard", now],
    [uuidv4(), profileId, "Interview Scheduled",
      "You have an interview with Tech Corp in 3 days.",
      "reminder", 0, "/dashboard/applications", "View Application", now],
  ]
  
  const insertNotif = sqlite.prepare(`
    INSERT INTO notifications (id, user_id, title, message, type, read, action_url, action_text, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  for (const notif of notifs) {
    insertNotif.run(...notif)
  }
}

export function getLocalUserId(): string {
  return LOCAL_USER_ID
}

export const localDb = {
  profiles: {
    get: (): Profile | undefined => {
      const sqlite = getDb()
      const result = sqlite.prepare("SELECT * FROM profiles WHERE id = ?").get(LOCAL_USER_ID) as any
      if (!result) return undefined
      return {
        id: result.id,
        email: result.email,
        full_name: result.full_name || undefined,
        avatar_url: result.avatar_url || undefined,
        created_at: result.created_at,
        updated_at: result.updated_at || undefined,
      }
    },
  },

  applications: {
    getAll: (): Application[] => {
      const sqlite = getDb()
      const results = sqlite.prepare("SELECT * FROM applications WHERE user_id = ? ORDER BY date_applied DESC").all(LOCAL_USER_ID) as any[]
      return results.map(mapApplicationRow)
    },
    getById: (id: string): Application | undefined => {
      const sqlite = getDb()
      const result = sqlite.prepare("SELECT * FROM applications WHERE id = ?").get(id) as any
      return result ? mapApplicationRow(result) : undefined
    },
    create: (data: Omit<Application, "id" | "user_id" | "created_at" | "updated_at">): Application => {
      const sqlite = getDb()
      const id = uuidv4()
      const now = new Date().toISOString()
      sqlite.prepare(`
        INSERT INTO applications (id, user_id, company, role, status, date_applied, notes, job_url, salary_range, location, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, LOCAL_USER_ID, data.company, data.role, data.status, data.date_applied || null, 
        data.notes || null, data.job_url || null, data.salary_range || null, data.location || null, now, now)
      return sqlite.prepare("SELECT * FROM applications WHERE id = ?").get(id) as Application
    },
    update: (id: string, data: Partial<Application>): Application | undefined => {
      const sqlite = getDb()
      const now = new Date().toISOString()
      const updates: string[] = ["updated_at = ?"]
      const values: any[] = [now]
      
      if (data.company !== undefined) { updates.push("company = ?"); values.push(data.company) }
      if (data.role !== undefined) { updates.push("role = ?"); values.push(data.role) }
      if (data.status !== undefined) { updates.push("status = ?"); values.push(data.status) }
      if (data.date_applied !== undefined) { updates.push("date_applied = ?"); values.push(data.date_applied) }
      if (data.notes !== undefined) { updates.push("notes = ?"); values.push(data.notes) }
      if (data.job_url !== undefined) { updates.push("job_url = ?"); values.push(data.job_url) }
      if (data.salary_range !== undefined) { updates.push("salary_range = ?"); values.push(data.salary_range) }
      if (data.location !== undefined) { updates.push("location = ?"); values.push(data.location) }
      
      values.push(id)
      sqlite.prepare(`UPDATE applications SET ${updates.join(", ")} WHERE id = ?`).run(...values)
      return sqlite.prepare("SELECT * FROM applications WHERE id = ?").get(id) as Application
    },
    delete: (id: string): boolean => {
      const sqlite = getDb()
      sqlite.prepare("DELETE FROM applications WHERE id = ?").run(id)
      return true
    },
    bulkCreate: (applicationsData: Array<Omit<Application, "id" | "user_id" | "created_at" | "updated_at">>): Application[] => {
      const sqlite = getDb()
      const now = new Date().toISOString()
      const created: Application[] = []
      
      const insertStmt = sqlite.prepare(`
        INSERT INTO applications (id, user_id, company, role, status, date_applied, notes, job_url, salary_range, location, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)

      for (const data of applicationsData) {
        const id = uuidv4()
        insertStmt.run(
          id, 
          LOCAL_USER_ID, 
          data.company, 
          data.role, 
          data.status, 
          data.date_applied || null, 
          data.notes || null, 
          data.job_url || null, 
          data.salary_range || null, 
          data.location || null, 
          now, 
          now
        )
        const result = sqlite.prepare("SELECT * FROM applications WHERE id = ?").get(id)
        if (result) {
          created.push(mapApplicationRow(result))
        }
      }
      
      return created
    },
  },

  skills: {
    getAll: (): Skill[] => {
      const sqlite = getDb()
      const results = sqlite.prepare("SELECT * FROM skills WHERE user_id = ?").all(LOCAL_USER_ID) as any[]
      return results.map(mapSkillRow)
    },
    getById: (id: string): Skill | undefined => {
      const sqlite = getDb()
      const result = sqlite.prepare("SELECT * FROM skills WHERE id = ?").get(id) as any
      return result ? mapSkillRow(result) : undefined
    },
    create: (data: Omit<Skill, "id" | "user_id" | "created_at" | "updated_at">): Skill => {
      const sqlite = getDb()
      const id = uuidv4()
      const now = new Date().toISOString()
      sqlite.prepare(`
        INSERT INTO skills (id, user_id, skill_name, proficiency, target_proficiency, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, LOCAL_USER_ID, data.skill_name, data.proficiency, data.target_proficiency || null, now, now)
      return mapSkillRow(sqlite.prepare("SELECT * FROM skills WHERE id = ?").get(id) as any)
    },
    update: (id: string, data: Partial<Skill>): Skill | undefined => {
      const sqlite = getDb()
      const now = new Date().toISOString()
      const updates: string[] = ["updated_at = ?"]
      const values: any[] = [now]
      
      if (data.skill_name !== undefined) { updates.push("skill_name = ?"); values.push(data.skill_name) }
      if (data.proficiency !== undefined) { updates.push("proficiency = ?"); values.push(data.proficiency) }
      if (data.target_proficiency !== undefined) { updates.push("target_proficiency = ?"); values.push(data.target_proficiency) }
      
      values.push(id)
      sqlite.prepare(`UPDATE skills SET ${updates.join(", ")} WHERE id = ?`).run(...values)
      return mapSkillRow(sqlite.prepare("SELECT * FROM skills WHERE id = ?").get(id) as any)
    },
    delete: (id: string): boolean => {
      const sqlite = getDb()
      sqlite.prepare("DELETE FROM skills WHERE id = ?").run(id)
      return true
    },
  },

  tasks: {
    getAll: (): Task[] => {
      const sqlite = getDb()
      const results = sqlite.prepare("SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC").all(LOCAL_USER_ID) as any[]
      return results.map(mapTaskRow)
    },
    getById: (id: string): Task | undefined => {
      const sqlite = getDb()
      const result = sqlite.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as any
      return result ? mapTaskRow(result) : undefined
    },
    create: (data: Omit<Task, "id" | "user_id" | "created_at" | "updated_at">): Task => {
      const sqlite = getDb()
      const id = uuidv4()
      const now = new Date().toISOString()
      sqlite.prepare(`
        INSERT INTO tasks (id, user_id, description, due_date, is_complete, priority, tags, context, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, LOCAL_USER_ID, data.description, data.due_date || null, data.is_complete ? 1 : 0, 
        data.priority, data.tags ? JSON.stringify(data.tags) : null, data.context || null, data.status || null, now, now)
      return mapTaskRow(sqlite.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as any)
    },
    update: (id: string, data: Partial<Task>): Task | undefined => {
      const sqlite = getDb()
      const now = new Date().toISOString()
      const updates: string[] = ["updated_at = ?"]
      const values: any[] = [now]
      
      if (data.description !== undefined) { updates.push("description = ?"); values.push(data.description) }
      if (data.due_date !== undefined) { updates.push("due_date = ?"); values.push(data.due_date) }
      if (data.is_complete !== undefined) { updates.push("is_complete = ?"); values.push(data.is_complete ? 1 : 0) }
      if (data.priority !== undefined) { updates.push("priority = ?"); values.push(data.priority) }
      if (data.tags !== undefined) { updates.push("tags = ?"); values.push(JSON.stringify(data.tags)) }
      if (data.context !== undefined) { updates.push("context = ?"); values.push(data.context) }
      if (data.status !== undefined) { updates.push("status = ?"); values.push(data.status) }
      
      values.push(id)
      sqlite.prepare(`UPDATE tasks SET ${updates.join(", ")} WHERE id = ?`).run(...values)
      return mapTaskRow(sqlite.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as any)
    },
    delete: (id: string): boolean => {
      const sqlite = getDb()
      sqlite.prepare("DELETE FROM tasks WHERE id = ?").run(id)
      return true
    },
  },

  notifications: {
    getAll: (): Notification[] => {
      const sqlite = getDb()
      return sqlite.prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC").all(LOCAL_USER_ID) as Notification[]
    },
    markAsRead: (id: string): void => {
      const sqlite = getDb()
      sqlite.prepare("UPDATE notifications SET read = 1 WHERE id = ?").run(id)
    },
    markAllAsRead: (): void => {
      const sqlite = getDb()
      sqlite.prepare("UPDATE notifications SET read = 1 WHERE user_id = ?").run(LOCAL_USER_ID)
    },
  },
}

function sanitizeHtml(str: string | undefined | null): string | undefined {
  if (!str) return undefined
  let cleaned = str.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n')
  cleaned = cleaned.replace(/<[^>]*>/g, '')
  cleaned = cleaned.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  cleaned = cleaned.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
  cleaned = cleaned.trim().replace(/\s+/g, ' ')
  return cleaned || undefined
}

function mapApplicationRow(row: any): Application {
  return {
    id: row.id,
    user_id: row.user_id,
    company: sanitizeHtml(row.company) || row.company,
    role: sanitizeHtml(row.role) || row.role,
    status: row.status,
    date_applied: row.date_applied || undefined,
    notes: row.notes || undefined,
    job_url: row.job_url || undefined,
    salary_range: row.salary_range || undefined,
    location: row.location || undefined,
    created_at: row.created_at,
    updated_at: row.updated_at || undefined,
  }
}

function mapSkillRow(row: any): Skill {
  return {
    id: row.id,
    user_id: row.user_id,
    skill_name: row.skill_name,
    proficiency: row.proficiency,
    target_proficiency: row.target_proficiency ?? undefined,
    created_at: row.created_at,
    updated_at: row.updated_at || undefined,
  }
}

function mapTaskRow(row: any): Task {
  return {
    id: row.id,
    user_id: row.user_id,
    description: row.description,
    due_date: row.due_date || undefined,
    is_complete: Boolean(row.is_complete),
    priority: row.priority,
    tags: row.tags ? JSON.parse(row.tags) : undefined,
    context: row.context || undefined,
    status: row.status || undefined,
    created_at: row.created_at,
    updated_at: row.updated_at || undefined,
  }
}
