"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bookmark, ExternalLink, MapPin, DollarSign, Clock, Star, Search, Filter } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"

interface JobRecommendation {
  id: string
  title: string
  company: string
  location: string
  salary_range: string | null
  description: string
  requirements: string[]
  job_url: string
  source: string
  match_score: number
  saved: boolean
  created_at: string
}

// Mock data for demonstration
const mockJobs: JobRecommendation[] = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    company: "Google",
    location: "Mountain View, CA",
    salary_range: "$150,000 - $200,000",
    description:
      "Join our team to build the next generation of web applications using React, TypeScript, and modern web technologies.",
    requirements: ["React", "TypeScript", "JavaScript", "CSS", "HTML", "Node.js"],
    job_url: "https://careers.google.com/jobs/123",
    source: "Google Careers",
    match_score: 95,
    saved: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Full Stack Engineer",
    company: "Meta",
    location: "Menlo Park, CA",
    salary_range: "$140,000 - $180,000",
    description: "Build scalable web applications and APIs that serve billions of users worldwide.",
    requirements: ["React", "Python", "GraphQL", "PostgreSQL", "AWS"],
    job_url: "https://careers.meta.com/jobs/456",
    source: "Meta Careers",
    match_score: 88,
    saved: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Software Engineer",
    company: "Netflix",
    location: "Los Gatos, CA",
    salary_range: "$130,000 - $170,000",
    description: "Help us deliver entertainment to millions of users with cutting-edge streaming technology.",
    requirements: ["Java", "Spring Boot", "Microservices", "Kafka", "Docker"],
    job_url: "https://jobs.netflix.com/jobs/789",
    source: "Netflix Jobs",
    match_score: 82,
    saved: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "4",
    title: "React Developer",
    company: "Airbnb",
    location: "San Francisco, CA",
    salary_range: "$120,000 - $160,000",
    description: "Create beautiful and intuitive user experiences for our global platform.",
    requirements: ["React", "Redux", "JavaScript", "CSS", "Testing"],
    job_url: "https://careers.airbnb.com/jobs/101",
    source: "Airbnb Careers",
    match_score: 90,
    saved: false,
    created_at: new Date().toISOString(),
  },
]

export default function JobRecommendationsPage() {
  const [jobs, setJobs] = useState<JobRecommendation[]>(mockJobs)
  const [filteredJobs, setFilteredJobs] = useState<JobRecommendation[]>(mockJobs)
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("all")
  const [salaryFilter, setSalaryFilter] = useState("all")
  const [savedOnly, setSavedOnly] = useState(false)
  const [loading, setLoading] = useState(false)

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    filterJobs()
  }, [searchTerm, locationFilter, salaryFilter, savedOnly, jobs])

  const filterJobs = () => {
    let filtered = jobs

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.requirements.some((req) => req.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Location filter
    if (locationFilter !== "all") {
      filtered = filtered.filter((job) => job.location.includes(locationFilter))
    }

    // Salary filter
    if (salaryFilter !== "all") {
      filtered = filtered.filter((job) => {
        if (!job.salary_range) return false
        const salary = Number.parseInt(job.salary_range.replace(/[^0-9]/g, ""))
        switch (salaryFilter) {
          case "100k+":
            return salary >= 100000
          case "150k+":
            return salary >= 150000
          case "200k+":
            return salary >= 200000
          default:
            return true
        }
      })
    }

    // Saved filter
    if (savedOnly) {
      filtered = filtered.filter((job) => job.saved)
    }

    setFilteredJobs(filtered)
  }

  const toggleSaveJob = async (jobId: string) => {
    setJobs(jobs.map((job) => (job.id === jobId ? { ...job, saved: !job.saved } : job)))

    toast({
      title: "Success",
      description: "Job bookmark updated",
    })
  }

  const refreshRecommendations = async () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Success",
        description: "Job recommendations refreshed",
      })
      setLoading(false)
    }, 1000)
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    if (score >= 80) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    if (score >= 70) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
    return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Job Recommendations</h1>
          <p className="text-muted-foreground">AI-powered job matches based on your profile and preferences</p>
        </div>
        <Button onClick={refreshRecommendations} disabled={loading}>
          <Star className="mr-2 h-4 w-4" />
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Filters */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="CA">California</SelectItem>
                  <SelectItem value="NY">New York</SelectItem>
                  <SelectItem value="WA">Washington</SelectItem>
                  <SelectItem value="Remote">Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Salary</label>
              <Select value={salaryFilter} onValueChange={setSalaryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Salaries</SelectItem>
                  <SelectItem value="100k+">$100k+</SelectItem>
                  <SelectItem value="150k+">$150k+</SelectItem>
                  <SelectItem value="200k+">$200k+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Show</label>
              <Select value={savedOnly ? "saved" : "all"} onValueChange={(value) => setSavedOnly(value === "saved")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jobs</SelectItem>
                  <SelectItem value="saved">Saved Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            {filteredJobs.length} Job{filteredJobs.length !== 1 ? "s" : ""} Found
          </h2>
          <Badge variant="outline">{jobs.filter((job) => job.saved).length} Saved</Badge>
        </div>

        {filteredJobs.length === 0 ? (
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground mb-4">No jobs match your current filters</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setLocationFilter("all")
                  setSalaryFilter("all")
                  setSavedOnly(false)
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="dark:bg-gray-800 dark:border-gray-700 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold">{job.title}</h3>
                        <Badge className={getMatchScoreColor(job.match_score)}>{job.match_score}% Match</Badge>
                      </div>
                      <p className="text-lg text-muted-foreground mb-2">{job.company}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location}</span>
                        </div>
                        {job.salary_range && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span>{job.salary_range}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(job.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleSaveJob(job.id)}
                        className={job.saved ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20" : ""}
                      >
                        <Bookmark className={`h-4 w-4 ${job.saved ? "fill-current" : ""}`} />
                      </Button>
                      <Button size="sm" asChild>
                        <a href={job.job_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Apply
                        </a>
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{job.description}</p>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-2">Required Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {job.requirements.map((req, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Source: {job.source}</span>
                      <span>Posted: {new Date(job.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
