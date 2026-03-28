"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Mail, 
  Link2, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  Check, 
  Loader2, 
  RefreshCw, 
  AlertCircle,
  ExternalLink,
  Shield,
  Sparkles,
  Clock,
  Filter,
  ArrowRight,
  Key,
  Users,
  Globe
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ParsedApplication {
  id: string
  company: string
  role: string
  status: "Applied" | "Interviewing" | "Offer" | "Rejected" | "Saved"
  date_applied?: string
  notes?: string
  job_url?: string
  salary_range?: string
  location?: string
  source: "email"
  email_subject?: string
  email_from?: string
  email_date?: string
}

const SUPPORTED_PLATFORMS = [
  { name: "LinkedIn", color: "bg-[#0A66C2] hover:bg-[#004182]" },
  { name: "Indeed", color: "bg-[#003A9B] hover:bg-[#002d7a]" },
  { name: "Glassdoor", color: "bg-[#0EAFB3] hover:bg-[#0a9296]" },
  { name: "Greenhouse", color: "bg-[#5AAA3D] hover:bg-[#4a8f32]" },
  { name: "Lever", color: "bg-[#F9691E] hover:bg-[#d55a17]" },
]

export default function EmailImportPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [parsedApplications, setParsedApplications] = useState<ParsedApplication[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [parsing, setParsing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [clientId, setClientId] = useState("")
  const [clientSecret, setClientSecret] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const storedToken = localStorage.getItem("gmail_access_token")
    if (storedToken) {
      setAccessToken(storedToken)
      setIsConnected(true)
    }
  }, [])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GMAIL_TOKEN') {
        const token = event.data.token
        localStorage.setItem("gmail_access_token", token)
        setAccessToken(token)
        setIsConnected(true)
        toast({
          title: "Success",
          description: "Gmail connected successfully!"
        })
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const handleConnect = async () => {
    if (!clientId.trim() || !clientSecret.trim()) {
      toast({
        title: "Missing Credentials",
        description: "Please enter both Client ID and Client Secret",
        variant: "destructive"
      })
      return
    }
    localStorage.setItem("gmail_client_id", clientId.trim())
    localStorage.setItem("gmail_client_secret", clientSecret.trim())
    
    try {
      const response = await fetch(`/api/email?action=auth-url&clientId=${encodeURIComponent(clientId.trim())}&clientSecret=${encodeURIComponent(clientSecret.trim())}`)
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get auth URL",
        variant: "destructive"
      })
    }
  }

  const handleDisconnect = () => {
    setAccessToken(null)
    setIsConnected(false)
    localStorage.removeItem("gmail_access_token")
    localStorage.removeItem("gmail_client_id")
    localStorage.removeItem("gmail_client_secret")
    setParsedApplications([])
    setSelectedIds([])
    setClientId("")
    setClientSecret("")
  }

  const handleParse = async () => {
    if (!accessToken) return

    setParsing(true)
    try {
      const response = await fetch(`/api/email?action=parse`, {
        headers: { "x-access-token": accessToken }
      })
      
      if (!response.ok) {
        throw new Error("Failed to parse emails")
      }

      const data = await response.json()
      setParsedApplications(data.applications || [])
      
      toast({
        title: "Parsing Complete",
        description: `Found ${data.applications?.length || 0} job applications`
      })
    } catch (error) {
      console.error("Parse error:", error)
      toast({
        title: "Parse Failed",
        description: "Failed to parse emails. Check your access token.",
        variant: "destructive"
      })
    } finally {
      setParsing(false)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(parsedApplications.map(app => app.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id])
    } else {
      setSelectedIds(selectedIds.filter(i => i !== id))
    }
  }

  const handleImport = async () => {
    if (selectedIds.length === 0) return

    setImporting(true)
    try {
      const toImport = parsedApplications.filter(app => selectedIds.includes(app.id))
      
      const response = await fetch("/api/email/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applications: toImport })
      })

      if (!response.ok) {
        throw new Error("Failed to import applications")
      }

      const data = await response.json()
      
      toast({
        title: "Import Complete",
        description: `Imported ${data.imported} applications successfully`
      })

      setParsedApplications(parsedApplications.filter(app => !selectedIds.includes(app.id)))
      setSelectedIds([])
    } catch (error) {
      console.error("Import error:", error)
      toast({
        title: "Import Failed",
        description: "Failed to import selected applications",
        variant: "destructive"
      })
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto h-[calc(100vh-theme(spacing.4))] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Import Jobs from Email
          </h1>
          <p className="text-muted-foreground mt-1">Automatically extract job applications from your Gmail inbox</p>
        </div>
      </div>

      {!isConnected ? (
        <div className="space-y-6 flex-1">
          <Card className="glass-card border-white/10 bg-gradient-to-br from-card/50 to-card/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Setup Instructions
              </CardTitle>
              <CardDescription>
                Follow these steps to connect your Gmail account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="flex gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">1</span>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-sm">Go to Google Cloud Console</p>
                      <a
                        href="https://console.cloud.google.com/apis/credentials"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        Open Credentials Page
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">2</span>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-sm">Create a Project</p>
                      <p className="text-xs text-muted-foreground">Name it &quot;Job Tracker&quot;</p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">3</span>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-sm">Enable Gmail API</p>
                      <p className="text-xs text-muted-foreground">Search and enable in API Library</p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">4</span>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-sm">Create OAuth Credentials</p>
                      <p className="text-xs text-muted-foreground font-mono">http://localhost:3000/api/email/callback</p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">5</span>
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-sm">Get Your Credentials</p>
                      <p className="text-xs text-muted-foreground">Copy Client ID & Secret below</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10 bg-gradient-to-br from-card/50 to-card/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                Credentials Input
              </CardTitle>
              <CardDescription>
                Enter your Google OAuth credentials to connect
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-500">Security Notice</p>
                    <p className="text-muted-foreground mt-1">
                      Your credentials are stored locally in your browser and are never sent to any external servers.
                    </p>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="clientId">Client ID</Label>
                    <Input
                      id="clientId"
                      placeholder="Enter your Google Client ID"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="clientSecret">Client Secret</Label>
                    <Input
                      id="clientSecret"
                      type="password"
                      placeholder="Enter your Google Client Secret"
                      value={clientSecret}
                      onChange={(e) => setClientSecret(e.target.value)}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                </div>
                <Button onClick={handleConnect} className="bg-primary hover:bg-primary/90">
                  <Mail className="mr-2 h-4 w-4" />
                  Connect Gmail
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10 bg-gradient-to-br from-card/50 to-card/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Supported Platforms
              </CardTitle>
              <CardDescription>
                We automatically detect job applications from these sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {SUPPORTED_PLATFORMS.map((platform) => (
                  <Badge
                    key={platform.name}
                    variant="secondary"
                    className={`${platform.color} text-white px-4 py-2 text-sm font-medium`}
                  >
                    <Briefcase className="mr-2 h-4 w-4" />
                    {platform.name}
                  </Badge>
                ))}
              </div>
              <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>Our AI parser intelligently identifies job application emails and extracts relevant details</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10 bg-gradient-to-br from-card/50 to-card/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-primary" />
                Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex gap-3 p-3 bg-white/5 rounded-lg">
                  <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium text-sm">Search Period</p>
                    <p className="text-xs text-muted-foreground">We search emails from the last 6 months by default</p>
                  </div>
                </div>
                <div className="flex gap-3 p-3 bg-white/5 rounded-lg">
                  <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium text-sm">Skip Duplicates</p>
                    <p className="text-xs text-muted-foreground">Already imported applications are automatically skipped</p>
                  </div>
                </div>
                <div className="flex gap-3 p-3 bg-white/5 rounded-lg">
                  <Users className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium text-sm">Smart Detection</p>
                    <p className="text-xs text-muted-foreground">AI recognizes application confirmations from various sources</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6 flex-1">
          <Card className="glass-card border-white/10 bg-gradient-to-br from-card/50 to-card/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                Gmail Connected
              </CardTitle>
              <CardDescription>
                Your Gmail account is linked and ready to parse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Mail className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium text-green-500">Connected</p>
                    <p className="text-sm text-muted-foreground">Ready to parse job applications</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleParse}
                    disabled={parsing}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {parsing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Parsing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Parse Emails
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleDisconnect}
                    className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {parsedApplications.length > 0 && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">
                    {parsedApplications.length} applications found
                  </span>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedIds.length === parsedApplications.length && parsedApplications.length > 0}
                      onCheckedChange={handleSelectAll}
                      className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label className="text-sm text-muted-foreground">Select All</Label>
                  </div>
                </div>
                <Button
                  onClick={handleImport}
                  disabled={selectedIds.length === 0 || importing}
                  className="bg-primary hover:bg-primary/90"
                >
                  {importing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      Import Selected ({selectedIds.length})
                    </>
                  )}
                </Button>
              </div>

              <Card className="glass-card flex-1 overflow-hidden border-white/10 bg-gradient-to-br from-card/50 to-card/10">
                <CardContent className="p-0">
                  <div className="divide-y divide-white/5">
                    {parsedApplications.map((app) => (
                      <div
                        key={app.id}
                        className="p-4 hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <Checkbox
                            checked={selectedIds.includes(app.id)}
                            onCheckedChange={(checked) => handleSelectOne(app.id, checked as boolean)}
                            className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary mt-1"
                          />
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <h3 className="font-semibold text-lg">{app.company}</h3>
                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                  {app.role}
                                </Badge>
                              </div>
                              <Badge variant="secondary" className="bg-white/10 text-muted-foreground">
                                {app.status}
                              </Badge>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              {app.date_applied && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{new Date(app.date_applied).toLocaleDateString()}</span>
                                </div>
                              )}
                              {app.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{app.location}</span>
                                </div>
                              )}
                              {app.salary_range && (
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  <span>{app.salary_range}</span>
                                </div>
                              )}
                            </div>

                            {app.job_url && (
                              <div className="flex items-center gap-1 text-sm">
                                <Link2 className="h-4 w-4 text-muted-foreground" />
                                <a
                                  href={app.job_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline truncate max-w-md"
                                >
                                  {app.job_url}
                                </a>
                              </div>
                            )}

                            {app.email_subject && (
                              <div className="text-sm text-muted-foreground italic">
                                {app.email_subject}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {isConnected && parsedApplications.length === 0 && !parsing && (
            <Card className="glass-card border-white/10 bg-gradient-to-br from-card/50 to-card/10">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <Briefcase className="h-8 w-8 text-muted-foreground/30" />
                </div>
                <p className="text-xl font-medium text-foreground mb-2">No applications parsed yet</p>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm text-center">
                  Click &quot;Parse Emails&quot; to scan your inbox for job application confirmations from LinkedIn, Indeed, Glassdoor, and more.
                </p>
                <Button onClick={handleParse} className="bg-primary hover:bg-primary/90">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Parse Emails
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
