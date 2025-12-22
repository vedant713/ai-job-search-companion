"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bookmark, ExternalLink, MapPin, DollarSign, Clock, Star, Search, Filter, Sparkles, Building2, Briefcase, Linkedin } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"

interface JobRecommendation {
  id: string
  title: string
  company: string
  location: string
  salary_range: string | null
  description: string
  requirements: string[]
  job_url: string
  source: "LinkedIn" | "Indeed" | "Glassdoor" | "Company Site" | string
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
    job_url: "#",
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
    job_url: "#",
    source: "LinkedIn",
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
    job_url: "#",
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
    job_url: "#",
    source: "LinkedIn",
    match_score: 90,
    saved: false,
    created_at: new Date().toISOString(),
  },
  {
    id: "5",
    title: "AI Engineer",
    company: "OpenAI",
    location: "San Francisco, CA",
    salary_range: "$200,000 - $300,000",
    description: "Work on the frontier of artificial intelligence and build systems that can reason and learn.",
    requirements: ["Python", "PyTorch", "TensorFlow", "NLP", "Deep Learning"],
    job_url: "#",
    source: "OpenAI",
    match_score: 98,
    saved: true,
    created_at: new Date().toISOString(),
  },
  {
    id: "6",
    title: "Product Designer",
    company: "Stripe",
    location: "Remote",
    salary_range: "$130,000 - $190,000",
    description: "Design intuitive interfaces for financial tools used by millions of businesses.",
    requirements: ["Figma", "UI/UX", "Prototyping", "Design Systems"],
    job_url: "#",
    source: "LinkedIn",
    match_score: 85,
    saved: false,
    created_at: new Date().toISOString(),
  }
]

export default function JobRecommendationsPage() {
  const [jobs, setJobs] = useState<JobRecommendation[]>(mockJobs)
  const [filteredJobs, setFilteredJobs] = useState<JobRecommendation[]>(mockJobs)
  const [searchTerm, setSearchTerm] = useState("")
  const [locationFilter, setLocationFilter] = useState("all")
  const [salaryFilter, setSalaryFilter] = useState("all")
  const [savedOnly, setSavedOnly] = useState(false)
  const [loading, setLoading] = useState(false)

  // Smart Apply State
  const [selectedJob, setSelectedJob] = useState<JobRecommendation | null>(null)
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false)

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

  const handleApplyClick = (job: JobRecommendation) => {
    setSelectedJob(job)
    setIsApplyDialogOpen(true)
  }

  const handleSmartApply = async (shouldTrack: boolean) => {
    if (!selectedJob) return

    if (shouldTrack && user) {
      try {
        const { error } = await supabase.from("applications").insert({
          user_id: user.id,
          company: selectedJob.company,
          role: selectedJob.title,
          status: "Applied",
          job_url: selectedJob.job_url,
          location: selectedJob.location,
          notes: `Applied via Job Recommendations. Source: ${selectedJob.source}`,
          applied_date: new Date().toISOString()
        })

        if (error) throw error

        toast({
          title: "Application Tracked",
          description: `Successfully added ${selectedJob.title} at ${selectedJob.company} to your tracking board.`,
        })
      } catch (error) {
        console.error("Error tracking application:", error)
        toast({
          title: "Tracking Failed",
          description: "Could not automatically track this application. Please try adding it manually.",
          variant: "destructive"
        })
      }
    }

    // Open job URL in new tab
    window.open(selectedJob.job_url, "_blank")
    setIsApplyDialogOpen(false)
    setSelectedJob(null)
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-500/10 text-green-500 border-green-500/20"
    if (score >= 80) return "bg-blue-500/10 text-blue-500 border-blue-500/20"
    if (score >= 70) return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
    return "bg-gray-500/10 text-gray-400 border-gray-500/20"
  }

  const getSourceIcon = (source: string) => {
    if (source === "LinkedIn") return <Linkedin className="h-4 w-4 text-[#0077b5]" />
    return <Briefcase className="h-4 w-4" />
  }

  if (loading) {
    return <div className="flex items-center justify-center h-[calc(100vh-100px)] text-muted-foreground animate-pulse">Loading recommendations...</div>
  }

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto min-h-[calc(100vh-theme(spacing.4))]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent flex items-center gap-2">
            Job Recommendations <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">AI-powered matches tailored to your profile</p>
        </div>
        <Button
          onClick={refreshRecommendations}
          disabled={loading}
          className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all hover:scale-105"
        >
          <Star className="mr-2 h-4 w-4" />
          {loading ? "Refreshing..." : "Refresh Matches"}
        </Button>
      </div>

      {/* Filters */}
      <Card className="glass-card border-white/10 overflow-hidden">
        <CardHeader className="bg-white/5 border-b border-white/5 pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <Filter className="h-4 w-4 text-primary" />
            Filter Jobs
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Role, company, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-white/5 border-white/10 focus:border-primary/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Location</label>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="bg-white/5 border-white/10 focus:ring-primary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#09090b] border-white/10 text-white">
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="CA">California</SelectItem>
                  <SelectItem value="NY">New York</SelectItem>
                  <SelectItem value="WA">Washington</SelectItem>
                  <SelectItem value="Remote">Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Salary Range</label>
              <Select value={salaryFilter} onValueChange={setSalaryFilter}>
                <SelectTrigger className="bg-white/5 border-white/10 focus:ring-primary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#09090b] border-white/10 text-white">
                  <SelectItem value="all">Any Salary</SelectItem>
                  <SelectItem value="100k+">$100k+</SelectItem>
                  <SelectItem value="150k+">$150k+</SelectItem>
                  <SelectItem value="200k+">$200k+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">View</label>
              <Select value={savedOnly ? "saved" : "all"} onValueChange={(value) => setSavedOnly(value === "saved")}>
                <SelectTrigger className="bg-white/5 border-white/10 focus:ring-primary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#09090b] border-white/10 text-white">
                  <SelectItem value="all">All Recommendations</SelectItem>
                  <SelectItem value="saved">Saved Jobs Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Results */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="bg-primary/20 text-primary px-2 py-1 rounded-md text-sm">{filteredJobs.length}</span> matches found
          </h2>
          {jobs.filter((job) => job.saved).length > 0 && (
            <Badge variant="secondary" className="bg-white/10 hover:bg-white/20 transition-colors">
              {jobs.filter((job) => job.saved).length} saved jobs
            </Badge>
          )}
        </div>

        {filteredJobs.length === 0 ? (
          <Card className="glass-card border-white/10 bg-white/5">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-xl font-medium text-foreground mb-2">No jobs found</p>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Try adjusting your filters or search terms to see more opportunities.
              </p>
              <Button
                variant="outline"
                className="border-white/10 hover:bg-white/5 hover:text-white"
                onClick={() => {
                  setSearchTerm("")
                  setLocationFilter("all")
                  setSalaryFilter("all")
                  setSavedOnly(false)
                }}
              >
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredJobs.map((job) => (
              <Card key={job.id} className="glass-card border-white/10 hover:bg-white/5 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-primary/5 group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">{job.title}</h3>
                            <Badge variant="outline" className={`${getMatchScoreColor(job.match_score)} font-mono font-bold`}>
                              {job.match_score}% Match
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-lg text-muted-foreground">
                            <Building2 className="h-5 w-5 text-primary/70" />
                            <span className="font-medium text-foreground/80">{job.company}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleSaveJob(job.id)}
                            className={`h-10 w-10 rounded-full transition-all ${job.saved
                              ? "bg-primary/20 text-primary hover:bg-primary/30"
                              : "hover:bg-white/10 text-muted-foreground hover:text-white"
                              }`}
                          >
                            <Bookmark className={`h-5 w-5 ${job.saved ? "fill-current" : ""}`} />
                          </Button>
                          <Button
                            size="lg"
                            className="bg-white/10 hover:bg-white/20 text-white border border-white/10 shadow-lg"
                            onClick={() => handleApplyClick(job)}
                          >
                            <span className="flex items-center gap-2">
                              Apply Now
                              <ExternalLink className="h-4 w-4" />
                            </span>
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 md:gap-6 text-sm text-muted-foreground border-y border-white/5 py-4 my-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-full bg-blue-500/10 text-blue-400">
                            <MapPin className="h-4 w-4" />
                          </div>
                          <span>{job.location}</span>
                        </div>
                        {job.salary_range && (
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-full bg-green-500/10 text-green-400">
                              <DollarSign className="h-4 w-4" />
                            </div>
                            <span>{job.salary_range}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-full bg-purple-500/10 text-purple-400">
                            <Clock className="h-4 w-4" />
                          </div>
                          <span>Posted {new Date(job.created_at).toLocaleDateString("en-US")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-full bg-orange-500/10 text-orange-400">
                            {getSourceIcon(job.source)}
                          </div>
                          <span>{job.source}</span>
                        </div>
                      </div>

                      <p className="text-muted-foreground/80 leading-relaxed text-sm md:text-base">{job.description}</p>

                      <div className="space-y-3 pt-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">Required Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {job.requirements.map((req, index) => (
                            <Badge key={index} variant="secondary" className="bg-primary/5 hover:bg-primary/10 text-primary/80 border border-primary/10 transition-colors">
                              {req}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Smart Apply Dialog */}
      <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
        <DialogContent className="sm:max-w-md bg-[#0A0A0F]/90 backdrop-blur-xl border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="w-5 h-5 text-primary" />
              Smart Apply Tracking
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Would you like to automatically add this application to your dashboard?
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Card className="bg-white/5 border-white/5">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white">{selectedJob?.title}</p>
                  <p className="text-sm text-muted-foreground">{selectedJob?.company}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          <DialogFooter className="flex gap-2 sm:justify-between w-full">
            <Button
              variant="ghost"
              className="flex-1 hover:bg-white/5 text-muted-foreground"
              onClick={() => handleSmartApply(false)}
            >
              No, just open link
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25"
              onClick={() => handleSmartApply(true)}
            >
              Yes, Track Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
