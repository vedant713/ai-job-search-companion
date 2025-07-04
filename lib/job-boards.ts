// Job Board Integration
interface JobListing {
  id: string
  title: string
  company: string
  location: string
  salary?: string
  description: string
  requirements: string[]
  postedDate: Date
  source: "linkedin" | "indeed" | "glassdoor" | "company-website"
  url: string
  matchScore?: number
}

interface JobSearchParams {
  keywords: string
  location: string
  experienceLevel: string
  salary?: string
  remote?: boolean
}

export class JobBoardService {
  async searchJobs(params: JobSearchParams): Promise<JobListing[]> {
    // In production, integrate with job board APIs
    /*
    // LinkedIn API
    const linkedinJobs = await this.searchLinkedIn(params)
    
    // Indeed API
    const indeedJobs = await this.searchIndeed(params)
    
    // Combine and deduplicate results
    return [...linkedinJobs, ...indeedJobs]
    */

    // Mock job listings
    return [
      {
        id: "1",
        title: "Senior Frontend Developer",
        company: "TechCorp",
        location: "San Francisco, CA",
        salary: "$120k - $160k",
        description: "We are looking for a senior frontend developer to join our team...",
        requirements: ["React", "TypeScript", "5+ years experience"],
        postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        source: "linkedin",
        url: "https://linkedin.com/jobs/123",
        matchScore: 85,
      },
      {
        id: "2",
        title: "Full Stack Engineer",
        company: "StartupXYZ",
        location: "Remote",
        salary: "$100k - $140k",
        description: "Join our fast-growing startup as a full stack engineer...",
        requirements: ["Node.js", "React", "AWS", "3+ years experience"],
        postedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        source: "indeed",
        url: "https://indeed.com/jobs/456",
        matchScore: 78,
      },
    ]
  }

  async getJobRecommendations(userSkills: string[]): Promise<JobListing[]> {
    const jobs = await this.searchJobs({
      keywords: userSkills.join(" "),
      location: "Remote",
      experienceLevel: "senior",
    })

    // Calculate match scores based on user skills
    return jobs
      .map((job) => ({
        ...job,
        matchScore: this.calculateMatchScore(job.requirements, userSkills),
      }))
      .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
  }

  private calculateMatchScore(requirements: string[], userSkills: string[]): number {
    const matches = requirements.filter((req) =>
      userSkills.some(
        (skill) => skill.toLowerCase().includes(req.toLowerCase()) || req.toLowerCase().includes(skill.toLowerCase()),
      ),
    )
    return Math.round((matches.length / requirements.length) * 100)
  }

  async saveJobToApplications(job: JobListing): Promise<boolean> {
    // Save job to applications table
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: job.company,
          role: job.title,
          status: "Applied",
          notes: `Applied via ${job.source}. Match score: ${job.matchScore}%`,
          jobUrl: job.url,
        }),
      })
      return response.ok
    } catch (error) {
      console.error("Failed to save job:", error)
      return false
    }
  }
}

export const jobBoardService = new JobBoardService()
