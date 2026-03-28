import { NextResponse } from "next/server"
import { initializeLocalDb, localDb } from "@/lib/local-db"

const SKILL_PATTERNS = {
  "Programming Languages": [
    "JavaScript", "TypeScript", "Python", "Java", "C\\+\\+", "C#", "Go", "Rust", "Ruby", "PHP",
    "Swift", "Kotlin", "Scala", "R", "MATLAB", "Perl", "Haskell", "Elixir", "Clojure", "Dart"
  ],
  "Frameworks & Libraries": [
    "React", "Angular", "Vue", "Next\\.js", "Node\\.js", "Express", "Django", "Flask", "Spring",
    "Rails", "Laravel", "FastAPI", "NestJS", "Svelte", "Remix", "Gatsby", "Nuxt", "Echo",
    "Gin", "Fiber", "Phoenix", "NextJS", "React Native", "Flutter", "Expo"
  ],
  "Cloud & DevOps": [
    "AWS", "Azure", "GCP", "Google Cloud", "Docker", "Kubernetes", "Terraform", "Ansible",
    "Jenkins", "CircleCI", "GitHub Actions", "GitLab CI", "Travis CI", "Puppet", "Chef",
    "Helm", "Docker Swarm", "EKS", "AKS", "GKE", "Lambda", "ECS", "Fargate"
  ],
  "Databases": [
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch", "DynamoDB", "Cassandra",
    "SQLite", "Oracle", "SQL Server", "Firebase", "Supabase", "Neo4j", "CouchDB", "InfluxDB",
    "TimescaleDB", "PlanetScale", "Neon", "CockroachDB"
  ],
  "Tools & Technologies": [
    "Git", "GitHub", "GitLab", "Bitbucket", "Jira", "Confluence", "Slack", "Notion",
    "Figma", "Sketch", "Adobe XD", "VS Code", "IntelliJ", "PyCharm", "WebStorm",
    "Postman", "Insomnia", "Swagger", "REST", "GraphQL", "gRPC", "WebSocket"
  ],
  "AI & Machine Learning": [
    "TensorFlow", "PyTorch", "Keras", "Scikit-learn", "Pandas", "NumPy", "OpenAI",
    "Hugging Face", "LangChain", "GPT", "Claude", "Machine Learning", "Deep Learning",
    "NLP", "Computer Vision", "Reinforcement Learning", "MLOps", "Data Science",
    "Artificial Intelligence", "Neural Networks", "Transformers", "LLM"
  ],
  "Soft Skills": [
    "Leadership", "Communication", "Problem Solving", "Teamwork", "Project Management",
    "Agile", "Scrum", "Critical Thinking", "Time Management", "Collaboration",
    "Presentation", "Mentoring", "Strategic Planning", "Decision Making"
  ]
}

function extractSkillsFromText(text: string): string[] {
  if (!text) return []
  const foundSkills: string[] = []
  const lowerText = text.toLowerCase()

  for (const [category, patterns] of Object.entries(SKILL_PATTERNS)) {
    for (const pattern of patterns) {
      try {
        const regex = new RegExp(`\\b${pattern}\\b`, "gi")
        if (regex.test(text)) {
          const displayName = pattern.replace("\\", "")
          if (!foundSkills.includes(displayName)) {
            foundSkills.push(displayName)
          }
        }
      } catch {
        if (text.includes(pattern.replace("\\", ""))) {
          const displayName = pattern.replace("\\", "")
          if (!foundSkills.includes(displayName)) {
            foundSkills.push(displayName)
          }
        }
      }
    }
  }

  return foundSkills
}

function categorizeSkill(skillName: string): string {
  const skill = skillName.toLowerCase()
  for (const [category, patterns] of Object.entries(SKILL_PATTERNS)) {
    for (const pattern of patterns) {
      try {
        const regex = new RegExp(`\\b${pattern}\\b`, "gi")
        if (regex.test(skill)) {
          return category
        }
      } catch {
        if (skill.includes(pattern.replace("\\", "").toLowerCase())) {
          return category
        }
      }
    }
  }
  return "Tools & Technologies"
}

function suggestProficiency(skillName: string, role: string): number {
  const commonEntryLevel = [
    "JavaScript", "HTML", "CSS", "Python", "React", "Node.js", "SQL", "Git"
  ]
  const commonMidLevel = [
    "TypeScript", "AWS", "Docker", "PostgreSQL", "MongoDB", "Redis", "GraphQL"
  ]
  const skill = skillName.toLowerCase()
  
  if (commonEntryLevel.some(s => skill.includes(s.toLowerCase()))) {
    return 40
  }
  if (commonMidLevel.some(s => skill.includes(s.toLowerCase()))) {
    return 25
  }
  return 10
}

function suggestTargetProficiency(skillName: string): number {
  const advancedSkills = [
    "Kubernetes", "TensorFlow", "PyTorch", "Machine Learning", "Deep Learning",
    "AWS", "Azure", "GCP", "GraphQL", "Rust", "Go"
  ]
  const skill = skillName.toLowerCase()
  
  if (advancedSkills.some(s => skill.includes(s.toLowerCase()))) {
    return 80
  }
  return 70
}

interface ApplicationData {
  id: string
  company: string
  role: string
  notes: string | null
  job_url: string | null
  status: string
  date_applied: string | null
  created_at: string
  updated_at: string | null
}

export async function GET() {
  try {
    await initializeLocalDb()
    const applications = localDb.applications.getAll() as ApplicationData[]
    
    const extractedSkillsMap = new Map<string, { skill: string; count: number; category: string; suggestedProficiency: number; suggestedTarget: number; sources: string[] }>()
    
    for (const app of applications) {
      const sources = [app.role, app.company, app.notes, app.job_url].filter(Boolean) as string[]
      
      for (const source of sources) {
        const skills = extractSkillsFromText(source)
        
        for (const skill of skills) {
          if (extractedSkillsMap.has(skill)) {
            const existing = extractedSkillsMap.get(skill)!
            existing.count++
            if (!existing.sources.includes(app.role)) {
              existing.sources.push(app.role)
            }
          } else {
            extractedSkillsMap.set(skill, {
              skill,
              count: 1,
              category: categorizeSkill(skill),
              suggestedProficiency: suggestProficiency(skill, app.role),
              suggestedTarget: suggestTargetProficiency(skill),
              sources: [app.role]
            })
          }
        }
      }
    }

    const suggestedSkills = Array.from(extractedSkillsMap.values())
      .sort((a, b) => b.count - a.count)
      .map(item => ({
        skill_name: item.skill,
        category: item.category,
        suggested_proficiency: item.suggestedProficiency,
        suggested_target: item.suggestedTarget,
        frequency: item.count,
        found_in_roles: item.sources,
        reason: item.count > 1 
          ? `Found in ${item.count} applications (${item.sources.slice(0, 2).join(", ")})${item.sources.length > 2 ? ` and ${item.sources.length - 2} more` : ""}`
          : `Found in ${item.sources[0]} applications`
      }))

    const existingSkills = localDb.skills.getAll()
    const existingSkillNames = new Set(existingSkills.map(s => s.skill_name.toLowerCase()))

    const newSuggestions = suggestedSkills.filter(s => !existingSkillNames.has(s.skill_name.toLowerCase()))

    const aiRecommendations = generateAIRecommendations(applications, existingSkills)

    return NextResponse.json({
      suggestedSkills: newSuggestions,
      alreadyTracked: suggestedSkills.filter(s => existingSkillNames.has(s.skill_name.toLowerCase())),
      aiRecommendations,
      totalApplications: applications.length
    })
  } catch (error) {
    console.error("Error parsing skills from applications:", error)
    return NextResponse.json({ error: "Failed to parse skills from applications" }, { status: 500 })
  }
}

function generateAIRecommendations(applications: ApplicationData[], existingSkills: any[]): Array<{ skill: string; category: string; reason: string; priority: "High" | "Medium" | "Low"; resources: string[] }> {
  const recommendations: Array<{ skill: string; category: string; reason: string; priority: "High" | "Medium" | "Low"; resources: string[] }> = []
  const existingSkillNames = new Set(existingSkills.map(s => s.skill_name.toLowerCase()))

  const roles = applications.map(app => app.role.toLowerCase())
  
  const roleKeywords = roles.join(" ").toLowerCase()
  
  const techTrends: Record<string, { category: string; reason: string; priority: "High" | "Medium" | "Low"; resources: string[] }> = {
    "React": { category: "Frameworks & Libraries", reason: "React is the most in-demand frontend framework in your target roles", priority: "High", resources: ["React Official Docs", "React Tutorial"] },
    "TypeScript": { category: "Programming Languages", reason: "TypeScript adoption is essential for modern development roles", priority: "High", resources: ["TypeScript Handbook", "TypeScript Deep Dive"] },
    "Node.js": { category: "Frameworks & Libraries", reason: "Full-stack JavaScript is highly valued in your target companies", priority: "Medium", resources: ["Node.js Official Docs", "Node.js Crash Course"] },
    "Python": { category: "Programming Languages", reason: "Python is essential for backend and data-focused roles", priority: "Medium", resources: ["Python Docs", "Real Python"] },
    "AWS": { category: "Cloud & DevOps", reason: "Cloud skills are critical for senior engineering roles", priority: "High", resources: ["AWS Certified Solutions Architect", "A Cloud Guru"] },
    "Docker": { category: "Cloud & DevOps", reason: "Containerization is fundamental for modern deployment workflows", priority: "High", resources: ["Docker Official Tutorial", "Docker Deep Dive"] },
    "Kubernetes": { category: "Cloud & DevOps", reason: "Essential for managing containerized applications at scale", priority: "Medium", resources: ["Kubernetes Official Docs", "KillerCoda"] },
    "PostgreSQL": { category: "Databases", reason: "PostgreSQL is the preferred database for modern applications", priority: "Medium", resources: ["PostgreSQL Docs", "PostgreSQL Tutorial"] },
    "GraphQL": { category: "Tools & Technologies", reason: "GraphQL is increasingly requested for API development", priority: "Low", resources: ["GraphQL Official Docs", "Apollo GraphQL"] },
    "Machine Learning": { category: "AI & Machine Learning", reason: "ML skills are highly valued across tech roles", priority: "Medium", resources: ["Coursera ML Course", "Kaggle"] },
    "Git": { category: "Tools & Technologies", reason: "Version control is essential for any development role", priority: "High", resources: ["Git Official Docs", "Git Flight Rules"] },
  }

  for (const [skill, details] of Object.entries(techTrends)) {
    if (!existingSkillNames.has(skill.toLowerCase())) {
      const mentions = roles.filter(role => role.includes(skill.toLowerCase())).length
      if (mentions > 0 || Math.random() > 0.5) {
        recommendations.push({
          skill,
          ...details
        })
      }
    }
  }

  return recommendations.slice(0, 6)
}