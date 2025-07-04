// Resume Parser for automatic skill extraction
interface ParsedResume {
  personalInfo: {
    name: string
    email: string
    phone: string
    location: string
  }
  skills: string[]
  experience: {
    company: string
    position: string
    duration: string
    description: string
  }[]
  education: {
    institution: string
    degree: string
    year: string
  }[]
  projects: {
    name: string
    description: string
    technologies: string[]
  }[]
}

export class ResumeParser {
  private skillKeywords = [
    // Programming Languages
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "C++",
    "C#",
    "Go",
    "Rust",
    "PHP",
    "Ruby",
    // Frontend
    "React",
    "Vue",
    "Angular",
    "HTML",
    "CSS",
    "SASS",
    "SCSS",
    "Tailwind",
    "Bootstrap",
    // Backend
    "Node.js",
    "Express",
    "Django",
    "Flask",
    "Spring",
    "Laravel",
    "Rails",
    // Databases
    "MySQL",
    "PostgreSQL",
    "MongoDB",
    "Redis",
    "SQLite",
    "Oracle",
    // Cloud & DevOps
    "AWS",
    "Azure",
    "GCP",
    "Docker",
    "Kubernetes",
    "Jenkins",
    "GitLab CI",
    "GitHub Actions",
    // Tools & Frameworks
    "Git",
    "Webpack",
    "Vite",
    "Jest",
    "Cypress",
    "Figma",
    "Adobe XD",
  ]

  async parseResumeFile(file: File): Promise<ParsedResume> {
    try {
      const text = await this.extractTextFromFile(file)
      return this.parseResumeText(text)
    } catch (error) {
      console.error("Resume parsing failed:", error)
      throw new Error("Failed to parse resume")
    }
  }

  private async extractTextFromFile(file: File): Promise<string> {
    if (file.type === "application/pdf") {
      // In production, use PDF parsing library like pdf-parse
      /*
      const pdfParse = require('pdf-parse')
      const buffer = await file.arrayBuffer()
      const data = await pdfParse(Buffer.from(buffer))
      return data.text
      */
      return "Mock PDF text content with React, TypeScript, Node.js experience..."
    } else if (file.type.includes("text")) {
      return await file.text()
    } else {
      throw new Error("Unsupported file type")
    }
  }

  private parseResumeText(text: string): ParsedResume {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    return {
      personalInfo: this.extractPersonalInfo(text),
      skills: this.extractSkills(text),
      experience: this.extractExperience(lines),
      education: this.extractEducation(lines),
      projects: this.extractProjects(lines),
    }
  }

  private extractPersonalInfo(text: string) {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/
    const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/

    return {
      name: "John Doe", // Extract from first line or header
      email: text.match(emailRegex)?.[0] || "",
      phone: text.match(phoneRegex)?.[0] || "",
      location: "San Francisco, CA", // Extract from address patterns
    }
  }

  private extractSkills(text: string): string[] {
    const foundSkills = this.skillKeywords.filter((skill) => text.toLowerCase().includes(skill.toLowerCase()))

    // Remove duplicates and return
    return [...new Set(foundSkills)]
  }

  private extractExperience(lines: string[]) {
    // Mock experience extraction
    return [
      {
        company: "TechCorp",
        position: "Senior Developer",
        duration: "2020 - Present",
        description: "Led frontend development team...",
      },
    ]
  }

  private extractEducation(lines: string[]) {
    return [
      {
        institution: "University of Technology",
        degree: "Bachelor of Computer Science",
        year: "2018",
      },
    ]
  }

  private extractProjects(lines: string[]) {
    return [
      {
        name: "E-commerce Platform",
        description: "Built a full-stack e-commerce platform",
        technologies: ["React", "Node.js", "MongoDB"],
      },
    ]
  }

  async updateUserSkillsFromResume(resumeData: ParsedResume): Promise<boolean> {
    try {
      // Update user skills in database
      const response = await fetch("/api/skills/bulk-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills: resumeData.skills.map((skill) => ({
            skillName: skill,
            proficiency: 70, // Default proficiency
          })),
        }),
      })
      return response.ok
    } catch (error) {
      console.error("Failed to update skills:", error)
      return false
    }
  }
}

export const resumeParser = new ResumeParser()
