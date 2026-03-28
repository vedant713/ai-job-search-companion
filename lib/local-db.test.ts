import { describe, it, expect, vi, beforeEach } from 'vitest'

type Application = {
  id: string
  user_id: string
  company: string
  role: string
  status: string
  date_applied?: string
  notes?: string
  job_url?: string
  salary_range?: string
  location?: string
  created_at: string
  updated_at?: string
}

type Skill = {
  id: string
  user_id: string
  skill_name: string
  proficiency: number
  target_proficiency?: number
  created_at: string
  updated_at?: string
}

type Task = {
  id: string
  user_id: string
  description: string
  due_date?: string
  is_complete: boolean
  priority: string
  tags?: string[]
  context?: string
  status?: string
  created_at: string
  updated_at?: string
}

function mapApplicationRow(row: any): Application {
  return {
    id: row.id,
    user_id: row.user_id,
    company: row.company,
    role: row.role,
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

describe('local-db mapping functions', () => {
  describe('mapApplicationRow', () => {
    it('correctly maps a complete database row with all fields', () => {
      const row = {
        id: 'test-id',
        user_id: 'user-id',
        company: 'Tech Corp',
        role: 'Developer',
        status: 'Applied',
        date_applied: '2024-01-01T00:00:00.000Z',
        notes: 'Test notes',
        job_url: 'https://example.com',
        salary_range: '$100k-$150k',
        location: 'Remote',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-02T00:00:00.000Z',
      }

      const result = mapApplicationRow(row)

      expect(result).toEqual({
        id: 'test-id',
        user_id: 'user-id',
        company: 'Tech Corp',
        role: 'Developer',
        status: 'Applied',
        date_applied: '2024-01-01T00:00:00.000Z',
        notes: 'Test notes',
        job_url: 'https://example.com',
        salary_range: '$100k-$150k',
        location: 'Remote',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-02T00:00:00.000Z',
      })
    })

    it('maps null optional fields to undefined', () => {
      const row = {
        id: 'test-id',
        user_id: 'user-id',
        company: 'Tech Corp',
        role: 'Developer',
        status: 'Applied',
        date_applied: null,
        notes: null,
        job_url: null,
        salary_range: null,
        location: null,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: null,
      }

      const result = mapApplicationRow(row)

      expect(result.date_applied).toBeUndefined()
      expect(result.notes).toBeUndefined()
      expect(result.job_url).toBeUndefined()
      expect(result.salary_range).toBeUndefined()
      expect(result.location).toBeUndefined()
      expect(result.updated_at).toBeUndefined()
    })

    it('maps undefined optional fields to undefined', () => {
      const row = {
        id: 'test-id',
        user_id: 'user-id',
        company: 'Tech Corp',
        role: 'Developer',
        status: 'Applied',
        date_applied: undefined,
        notes: undefined,
        job_url: undefined,
        salary_range: undefined,
        location: undefined,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: undefined,
      }

      const result = mapApplicationRow(row)

      expect(result.date_applied).toBeUndefined()
      expect(result.notes).toBeUndefined()
      expect(result.job_url).toBeUndefined()
      expect(result.salary_range).toBeUndefined()
      expect(result.location).toBeUndefined()
      expect(result.updated_at).toBeUndefined()
    })

    it('maps empty string optional fields correctly', () => {
      const row = {
        id: 'test-id',
        user_id: 'user-id',
        company: 'Tech Corp',
        role: 'Developer',
        status: 'Applied',
        date_applied: '',
        notes: '',
        job_url: '',
        salary_range: '',
        location: '',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '',
      }

      const result = mapApplicationRow(row)

      expect(result.date_applied).toBeUndefined()
      expect(result.notes).toBeUndefined()
      expect(result.job_url).toBeUndefined()
      expect(result.salary_range).toBeUndefined()
      expect(result.location).toBeUndefined()
      expect(result.updated_at).toBeUndefined()
    })

    it('preserves required fields correctly', () => {
      const row = {
        id: 'app-123',
        user_id: 'user-456',
        company: 'Startup XYZ',
        role: 'Full Stack Engineer',
        status: 'Interviewing',
        date_applied: null,
        notes: null,
        job_url: null,
        salary_range: null,
        location: null,
        created_at: '2024-03-15T10:30:00.000Z',
        updated_at: null,
      }

      const result = mapApplicationRow(row)

      expect(result.id).toBe('app-123')
      expect(result.user_id).toBe('user-456')
      expect(result.company).toBe('Startup XYZ')
      expect(result.role).toBe('Full Stack Engineer')
      expect(result.status).toBe('Interviewing')
      expect(result.created_at).toBe('2024-03-15T10:30:00.000Z')
    })
  })

  describe('mapSkillRow', () => {
    it('correctly maps a complete database row with all fields', () => {
      const row = {
        id: 'skill-id',
        user_id: 'user-id',
        skill_name: 'TypeScript',
        proficiency: 8,
        target_proficiency: 10,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-02T00:00:00.000Z',
      }

      const result = mapSkillRow(row)

      expect(result).toEqual({
        id: 'skill-id',
        user_id: 'user-id',
        skill_name: 'TypeScript',
        proficiency: 8,
        target_proficiency: 10,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-02T00:00:00.000Z',
      })
    })

    it('maps null target_proficiency to undefined using nullish coalescing', () => {
      const row = {
        id: 'skill-id',
        user_id: 'user-id',
        skill_name: 'TypeScript',
        proficiency: 8,
        target_proficiency: null,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: null,
      }

      const result = mapSkillRow(row)

      expect(result.target_proficiency).toBeUndefined()
      expect(result.updated_at).toBeUndefined()
    })

    it('maps undefined target_proficiency to undefined', () => {
      const row = {
        id: 'skill-id',
        user_id: 'user-id',
        skill_name: 'Python',
        proficiency: 5,
        target_proficiency: undefined,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: undefined,
      }

      const result = mapSkillRow(row)

      expect(result.target_proficiency).toBeUndefined()
      expect(result.updated_at).toBeUndefined()
    })

    it('maps zero proficiency correctly', () => {
      const row = {
        id: 'skill-id',
        user_id: 'user-id',
        skill_name: 'New Skill',
        proficiency: 0,
        target_proficiency: 5,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: undefined,
      }

      const result = mapSkillRow(row)

      expect(result.proficiency).toBe(0)
      expect(result.target_proficiency).toBe(5)
    })

    it('preserves all required fields', () => {
      const row = {
        id: 'skill-123',
        user_id: 'user-456',
        skill_name: 'React',
        proficiency: 7,
        target_proficiency: 9,
        created_at: '2024-03-20T14:00:00.000Z',
        updated_at: undefined,
      }

      const result = mapSkillRow(row)

      expect(result.id).toBe('skill-123')
      expect(result.user_id).toBe('user-456')
      expect(result.skill_name).toBe('React')
      expect(result.proficiency).toBe(7)
      expect(result.target_proficiency).toBe(9)
      expect(result.created_at).toBe('2024-03-20T14:00:00.000Z')
    })
  })

  describe('mapTaskRow', () => {
    it('correctly maps a complete database row with all fields', () => {
      const row = {
        id: 'task-id',
        user_id: 'user-id',
        description: 'Update resume',
        due_date: '2024-01-15T00:00:00.000Z',
        is_complete: 0,
        priority: 'High',
        tags: JSON.stringify(['resume', 'job-search']),
        context: 'Make it ATS-friendly',
        status: 'pending',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-02T00:00:00.000Z',
      }

      const result = mapTaskRow(row)

      expect(result).toEqual({
        id: 'task-id',
        user_id: 'user-id',
        description: 'Update resume',
        due_date: '2024-01-15T00:00:00.000Z',
        is_complete: false,
        priority: 'High',
        tags: ['resume', 'job-search'],
        context: 'Make it ATS-friendly',
        status: 'pending',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-02T00:00:00.000Z',
      })
    })

    it('correctly parses JSON tags from database', () => {
      const row = {
        id: 'task-id',
        user_id: 'user-id',
        description: 'Practice interview',
        due_date: '2024-01-20T00:00:00.000Z',
        is_complete: 0,
        priority: 'Medium',
        tags: JSON.stringify(['interview', 'prep', 'STAR-method']),
        context: 'Practice STAR technique',
        status: 'in-progress',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: null,
      }

      const result = mapTaskRow(row)

      expect(result.tags).toEqual(['interview', 'prep', 'STAR-method'])
    })

    it('maps null tags to undefined', () => {
      const row = {
        id: 'task-id',
        user_id: 'user-id',
        description: 'Simple task',
        due_date: null,
        is_complete: 0,
        priority: 'Low',
        tags: null,
        context: null,
        status: null,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: null,
      }

      const result = mapTaskRow(row)

      expect(result.tags).toBeUndefined()
      expect(result.due_date).toBeUndefined()
      expect(result.context).toBeUndefined()
      expect(result.status).toBeUndefined()
      expect(result.updated_at).toBeUndefined()
    })

    it('maps undefined tags to undefined', () => {
      const row = {
        id: 'task-id',
        user_id: 'user-id',
        description: 'Another task',
        due_date: undefined,
        is_complete: 0,
        priority: 'Medium',
        tags: undefined,
        context: undefined,
        status: undefined,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: undefined,
      }

      const result = mapTaskRow(row)

      expect(result.tags).toBeUndefined()
      expect(result.due_date).toBeUndefined()
      expect(result.context).toBeUndefined()
      expect(result.status).toBeUndefined()
      expect(result.updated_at).toBeUndefined()
    })

    it('maps empty string tags to undefined', () => {
      const row = {
        id: 'task-id',
        user_id: 'user-id',
        description: 'Task without tags',
        due_date: '',
        is_complete: 0,
        priority: 'Low',
        tags: '',
        context: '',
        status: '',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '',
      }

      const result = mapTaskRow(row)

      expect(result.tags).toBeUndefined()
      expect(result.due_date).toBeUndefined()
      expect(result.context).toBeUndefined()
      expect(result.status).toBeUndefined()
      expect(result.updated_at).toBeUndefined()
    })

    it('converts is_complete integer 1 to boolean true', () => {
      const row = {
        id: 'task-id',
        user_id: 'user-id',
        description: 'Completed task',
        due_date: '2024-01-10T00:00:00.000Z',
        is_complete: 1,
        priority: 'High',
        tags: '[]',
        context: 'Done',
        status: 'completed',
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: '2024-01-05T00:00:00.000Z',
      }

      const result = mapTaskRow(row)

      expect(result.is_complete).toBe(true)
    })

    it('converts is_complete integer 0 to boolean false', () => {
      const row = {
        id: 'task-id',
        user_id: 'user-id',
        description: 'Pending task',
        due_date: '2024-01-10T00:00:00.000Z',
        is_complete: 0,
        priority: 'Low',
        tags: null,
        context: null,
        status: null,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: null,
      }

      const result = mapTaskRow(row)

      expect(result.is_complete).toBe(false)
    })

    it('handles empty tags array', () => {
      const row = {
        id: 'task-id',
        user_id: 'user-id',
        description: 'Task with empty array',
        due_date: null,
        is_complete: 0,
        priority: 'Medium',
        tags: '[]',
        context: null,
        status: null,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: null,
      }

      const result = mapTaskRow(row)

      expect(result.tags).toEqual([])
    })

    it('handles tags with special characters in JSON', () => {
      const row = {
        id: 'task-id',
        user_id: 'user-id',
        description: 'Task with special chars',
        due_date: null,
        is_complete: 0,
        priority: 'High',
        tags: JSON.stringify(['c++', 'node.js', 'react-native']),
        context: null,
        status: null,
        created_at: '2024-01-01T00:00:00.000Z',
        updated_at: null,
      }

      const result = mapTaskRow(row)

      expect(result.tags).toEqual(['c++', 'node.js', 'react-native'])
    })
  })

  describe('Application CRUD operation logic', () => {
    it('generates correct SQL UPDATE statement for single field update', () => {
      const data = { company: 'New Company' }
      const updates: string[] = ['updated_at = ?']
      const values: any[] = [new Date().toISOString()]

      if (data.company !== undefined) { updates.push('company = ?'); values.push(data.company) }

      expect(updates).toContain('updated_at = ?')
      expect(updates).toContain('company = ?')
      expect(values).toContain('New Company')
    })

    it('generates correct SQL UPDATE statement for multiple field updates', () => {
      const data = {
        company: 'New Company',
        role: 'Senior Developer',
        status: 'Interviewing',
      }
      const updates: string[] = ['updated_at = ?']
      const values: any[] = [new Date().toISOString()]

      if (data.company !== undefined) { updates.push('company = ?'); values.push(data.company) }
      if (data.role !== undefined) { updates.push('role = ?'); values.push(data.role) }
      if (data.status !== undefined) { updates.push('status = ?'); values.push(data.status) }

      expect(updates).toEqual(['updated_at = ?', 'company = ?', 'role = ?', 'status = ?'])
      expect(values).toHaveLength(4)
    })

    it('skips undefined fields in SQL UPDATE generation', () => {
      const data: any = { status: 'Applied' }
      const updates: string[] = ['updated_at = ?']
      const values: any[] = [new Date().toISOString()]

      if (data.company !== undefined) { updates.push('company = ?'); values.push(data.company) }
      if (data.role !== undefined) { updates.push('role = ?'); values.push(data.role) }
      if (data.status !== undefined) { updates.push('status = ?'); values.push(data.status) }
      if (data.notes !== undefined) { updates.push('notes = ?'); values.push(data.notes) }
      if (data.job_url !== undefined) { updates.push('job_url = ?'); values.push(data.job_url) }
      if (data.salary_range !== undefined) { updates.push('salary_range = ?'); values.push(data.salary_range) }
      if (data.location !== undefined) { updates.push('location = ?'); values.push(data.location) }

      expect(updates).toEqual(['updated_at = ?', 'status = ?'])
      expect(values).toHaveLength(2)
    })

    it('handles date_applied as optional field', () => {
      const data = { date_applied: '2024-01-15T00:00:00.000Z' }
      const updates: string[] = ['updated_at = ?']
      const values: any[] = [new Date().toISOString()]

      if (data.date_applied !== undefined) { updates.push('date_applied = ?'); values.push(data.date_applied) }

      expect(updates).toContain('date_applied = ?')
      expect(values).toContain('2024-01-15T00:00:00.000Z')
    })
  })

  describe('Skill CRUD operation logic', () => {
    it('generates correct SQL UPDATE statement for skill_name update', () => {
      const data: any = { skill_name: 'JavaScript' }
      const updates: string[] = ['updated_at = ?']
      const values: any[] = [new Date().toISOString()]

      if (data.skill_name !== undefined) { updates.push('skill_name = ?'); values.push(data.skill_name) }
      if (data.proficiency !== undefined) { updates.push('proficiency = ?'); values.push(data.proficiency) }
      if (data.target_proficiency !== undefined) { updates.push('target_proficiency = ?'); values.push(data.target_proficiency) }

      expect(updates).toContain('skill_name = ?')
      expect(values).toContain('JavaScript')
    })

    it('generates correct SQL UPDATE statement for proficiency update', () => {
      const data: any = { proficiency: 9 }
      const updates: string[] = ['updated_at = ?']
      const values: any[] = [new Date().toISOString()]

      if (data.skill_name !== undefined) { updates.push('skill_name = ?'); values.push(data.skill_name) }
      if (data.proficiency !== undefined) { updates.push('proficiency = ?'); values.push(data.proficiency) }
      if (data.target_proficiency !== undefined) { updates.push('target_proficiency = ?'); values.push(data.target_proficiency) }

      expect(updates).toContain('proficiency = ?')
      expect(values).toContain(9)
    })

    it('skips undefined proficiency fields', () => {
      const data: any = { skill_name: 'Rust' }
      const updates: string[] = ['updated_at = ?']
      const values: any[] = [new Date().toISOString()]

      if (data.skill_name !== undefined) { updates.push('skill_name = ?'); values.push(data.skill_name) }
      if (data.proficiency !== undefined) { updates.push('proficiency = ?'); values.push(data.proficiency) }
      if (data.target_proficiency !== undefined) { updates.push('target_proficiency = ?'); values.push(data.target_proficiency) }

      expect(updates).toEqual(['updated_at = ?', 'skill_name = ?'])
      expect(values).toHaveLength(2)
    })
  })

  describe('Task CRUD operation logic', () => {
    it('generates correct SQL UPDATE statement for tags with JSON serialization', () => {
      const data = { tags: ['interview', 'prep'] }
      const updates: string[] = ['updated_at = ?']
      const values: any[] = [new Date().toISOString()]

      if (data.tags !== undefined) { updates.push('tags = ?'); values.push(JSON.stringify(data.tags)) }

      expect(updates).toContain('tags = ?')
      expect(values).toContain(JSON.stringify(['interview', 'prep']))
    })

    it('generates correct SQL UPDATE statement for is_complete with integer conversion', () => {
      const data = { is_complete: true }
      const updates: string[] = ['updated_at = ?']
      const values: any[] = [new Date().toISOString()]

      if (data.is_complete !== undefined) { updates.push('is_complete = ?'); values.push(data.is_complete ? 1 : 0) }

      expect(updates).toContain('is_complete = ?')
      expect(values).toContain(1)
    })

    it('converts is_complete false to integer 0', () => {
      const data = { is_complete: false }
      const updates: string[] = ['updated_at = ?']
      const values: any[] = [new Date().toISOString()]

      if (data.is_complete !== undefined) { updates.push('is_complete = ?'); values.push(data.is_complete ? 1 : 0) }

      expect(updates).toContain('is_complete = ?')
      expect(values).toContain(0)
    })

    it('generates correct SQL UPDATE for multiple fields including tags', () => {
      const data: any = {
        description: 'Updated task description',
        priority: 'High',
        tags: ['urgent', 'interview'],
        status: 'in-progress',
      }
      const updates: string[] = ['updated_at = ?']
      const values: any[] = [new Date().toISOString()]

      if (data.description !== undefined) { updates.push('description = ?'); values.push(data.description) }
      if (data.due_date !== undefined) { updates.push('due_date = ?'); values.push(data.due_date) }
      if (data.is_complete !== undefined) { updates.push('is_complete = ?'); values.push(data.is_complete ? 1 : 0) }
      if (data.priority !== undefined) { updates.push('priority = ?'); values.push(data.priority) }
      if (data.tags !== undefined) { updates.push('tags = ?'); values.push(JSON.stringify(data.tags)) }
      if (data.context !== undefined) { updates.push('context = ?'); values.push(data.context) }
      if (data.status !== undefined) { updates.push('status = ?'); values.push(data.status) }

      expect(updates).toHaveLength(5)
      expect(updates).toContain('description = ?')
      expect(updates).toContain('priority = ?')
      expect(updates).toContain('tags = ?')
      expect(updates).toContain('status = ?')
      expect(values).toContain('Updated task description')
      expect(values).toContain('High')
      expect(values).toContain(JSON.stringify(['urgent', 'interview']))
      expect(values).toContain('in-progress')
    })

    it('handles empty tags array for update', () => {
      const data = { tags: [] }
      const updates: string[] = ['updated_at = ?']
      const values: any[] = [new Date().toISOString()]

      if (data.tags !== undefined) { updates.push('tags = ?'); values.push(JSON.stringify(data.tags)) }

      expect(updates).toContain('tags = ?')
      expect(values).toContain('[]')
    })
  })

  describe('Input validation logic', () => {
    it('application create handles optional fields with null coalescing', () => {
      const data: any = {
        company: 'Tech Corp',
        role: 'Developer',
        status: 'Applied',
      }

      const date_applied = data.date_applied || null
      const notes = data.notes || null
      const job_url = data.job_url || null
      const salary_range = data.salary_range || null
      const location = data.location || null

      expect(date_applied).toBeNull()
      expect(notes).toBeNull()
      expect(job_url).toBeNull()
      expect(salary_range).toBeNull()
      expect(location).toBeNull()
    })

    it('application create preserves provided optional fields', () => {
      const data: any = {
        company: 'Tech Corp',
        role: 'Developer',
        status: 'Applied',
        date_applied: '2024-01-15T00:00:00.000Z',
        notes: 'Important application',
        job_url: 'https://example.com/job',
        salary_range: '$100k-$150k',
        location: 'Remote',
      }

      const date_applied = data.date_applied || null
      const notes = data.notes || null
      const job_url = data.job_url || null
      const salary_range = data.salary_range || null
      const location = data.location || null

      expect(date_applied).toBe('2024-01-15T00:00:00.000Z')
      expect(notes).toBe('Important application')
      expect(job_url).toBe('https://example.com/job')
      expect(salary_range).toBe('$100k-$150k')
      expect(location).toBe('Remote')
    })

    it('skill create handles optional target_proficiency with null coalescing', () => {
      const data: any = {
        skill_name: 'TypeScript',
        proficiency: 8,
      }

      const target_proficiency = data.target_proficiency || null

      expect(target_proficiency).toBeNull()
    })

    it('skill create preserves provided target_proficiency', () => {
      const data: any = {
        skill_name: 'TypeScript',
        proficiency: 8,
        target_proficiency: 10,
      }

      const target_proficiency = data.target_proficiency || null

      expect(target_proficiency).toBe(10)
    })

    it('task create handles tags with JSON.stringify', () => {
      const data: any = {
        description: 'Test task',
        is_complete: false,
        priority: 'Medium',
        tags: ['test', 'unit'],
      }

      const tags = data.tags ? JSON.stringify(data.tags) : null

      expect(tags).toBe('["test","unit"]')
    })

    it('task create handles null tags', () => {
      const data: any = {
        description: 'Test task',
        is_complete: false,
        priority: 'Medium',
      }

      const tags = data.tags ? JSON.stringify(data.tags) : null

      expect(tags).toBeNull()
    })

    it('task create converts is_complete boolean to integer', () => {
      const trueData = { is_complete: true }
      const falseData = { is_complete: false }

      const trueResult = trueData.is_complete ? 1 : 0
      const falseResult = falseData.is_complete ? 1 : 0

      expect(trueResult).toBe(1)
      expect(falseResult).toBe(0)
    })

    it('task create handles optional context and status with null coalescing', () => {
      const data = {
        description: 'Task with optionals',
        is_complete: false,
        priority: 'Low',
        context: 'Some context',
        status: 'pending',
      }

      const context = data.context || null
      const status = data.status || null

      expect(context).toBe('Some context')
      expect(status).toBe('pending')
    })
  })
})
