"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Search, Briefcase, Filter, X, Download } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { BulkOperations } from "@/components/bulk-operations"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import type { Application } from "@/lib/supabase"

const statusConfig = {
  Applied: { color: "bg-primary/20 text-primary border-primary/20", label: "Applied" },
  Interviewing: { color: "bg-yellow-500/20 text-yellow-500 border-yellow-500/20", label: "Interviewing" },
  Offer: { color: "bg-green-500/20 text-green-500 border-green-500/20", label: "Offer" },
  Rejected: { color: "bg-red-500/20 text-red-500 border-red-500/20", label: "Rejected" },
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedApplications, setSelectedApplications] = useState<string[]>([])
  const [editingApplication, setEditingApplication] = useState<Application | null>(null)
  const [newApplication, setNewApplication] = useState({
    company: "",
    role: "",
    status: "Applied" as const,
    notes: "",
    job_url: "",
    salary_range: "",
    location: "",
  })

  const { user, isLocalMode } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user || isLocalMode) {
      fetchApplications()
    } else {
      setLoading(false)
    }
  }, [user, isLocalMode])

  const fetchApplications = async () => {
    try {
      if (isLocalMode) {
        const response = await fetch("/api/local/applications")
        const { applications: localApps } = await response.json()
        const mappedApps = localApps.map((app: any) => {
          const company = (app.company && !app.company.includes('<') && app.company.length < 100) 
            ? app.company 
            : "Unknown Company"
          const role = (app.role && !app.role.includes('<') && app.role.length < 100) 
            ? app.role 
            : "Unknown Role"
          
          return {
            ...app,
            id: app.id,
            user_id: app.user_id,
            company,
            role,
            status: app.status || "Applied",
            date_applied: app.date_applied || app.created_at,
            created_at: app.created_at || app.date_applied,
            updated_at: app.updated_at || app.date_applied,
          }
        })
setApplications(mappedApps)
      } else {
        const { data, error } = await supabase
          .from("applications")
          .select("*")
          .eq("user_id", user?.id)
          .order("created_at", { ascending: false })

        if (error) throw error
        setApplications(data || [])
      }
    } catch (error: any) {
      console.error("Error fetching applications:", error)
      toast({
        title: "Error",
        description: "Failed to fetch applications",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddApplication = async () => {
    if (!user && !isLocalMode) return

    try {
      if (isLocalMode) {
        await fetch("/api/local/applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newApplication),
        })
        await fetchApplications()
        setNewApplication({
          company: "",
          role: "",
          status: "Applied",
          notes: "",
          job_url: "",
          salary_range: "",
          location: "",
        })
        setIsAddDialogOpen(false)
        toast({
          title: "Success",
          description: "Application added successfully",
        })
      } else {
        const { data, error } = await supabase
          .from("applications")
          .insert({
            ...newApplication,
            user_id: user!.id,
          })
          .select()
          .single()

        if (error) throw error

        setApplications([data, ...applications])
        setNewApplication({
          company: "",
          role: "",
          status: "Applied",
          notes: "",
          job_url: "",
          salary_range: "",
          location: "",
        })
        setIsAddDialogOpen(false)

        toast({
          title: "Success",
          description: "Application added successfully",
        })
      }
    } catch (error: any) {
      console.error("Error adding application:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add application",
        variant: "destructive",
      })
    }
  }

  const handleEditApplication = async () => {
    if (!editingApplication || (!user && !isLocalMode)) return

    try {
      if (isLocalMode) {
        await fetch(`/api/local/applications/${editingApplication.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            company: editingApplication.company,
            role: editingApplication.role,
            status: editingApplication.status,
            notes: editingApplication.notes,
            job_url: editingApplication.job_url,
            salary_range: editingApplication.salary_range,
            location: editingApplication.location,
          }),
        })
        await fetchApplications()
        setEditingApplication(null)
        setIsEditDialogOpen(false)
        toast({
          title: "Success",
          description: "Application updated successfully",
        })
      } else {
        const { data, error } = await supabase
          .from("applications")
          .update({
            company: editingApplication.company,
            role: editingApplication.role,
            status: editingApplication.status,
            notes: editingApplication.notes,
            job_url: editingApplication.job_url,
            salary_range: editingApplication.salary_range,
            location: editingApplication.location,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingApplication.id)
          .eq("user_id", user!.id)
          .select()
          .single()

        if (error) throw error

        setApplications(applications.map((app) => (app.id === editingApplication.id ? data : app)))
        setEditingApplication(null)
        setIsEditDialogOpen(false)

        toast({
          title: "Success",
          description: "Application updated successfully",
        })
      }
    } catch (error: any) {
      console.error("Error updating application:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update application",
        variant: "destructive",
      })
    }
  }

  const handleDeleteApplication = async (id: string) => {
    if (!user && !isLocalMode) return

    try {
      if (isLocalMode) {
        await fetch(`/api/local/applications/${id}`, { method: "DELETE" })
        await fetchApplications()
        toast({
          title: "Success",
          description: "Application deleted successfully",
        })
      } else {
        const { error } = await supabase.from("applications").delete().eq("id", id).eq("user_id", user!.id)

        if (error) throw error

        setApplications(applications.filter((app) => app.id !== id))

        toast({
          title: "Success",
          description: "Application deleted successfully",
        })
      }
    } catch (error: any) {
      console.error("Error deleting application:", error)
      toast({
        title: "Error",
        description: "Failed to delete application",
        variant: "destructive",
      })
    }
  }

  const handleBulkDelete = async (ids: string[]) => {
    try {
      if (isLocalMode) {
        for (const id of ids) {
          await fetch(`/api/local/applications/${id}`, { method: "DELETE" })
        }
        await fetchApplications()
        setSelectedApplications([])
        toast({
          title: "Success",
          description: `${ids.length} applications deleted`,
        })
      } else {
        const { error } = await supabase.from("applications").delete().in("id", ids)

        if (error) throw error

        setApplications(applications.filter((app) => !ids.includes(app.id)))
        setSelectedApplications([])

        toast({
          title: "Success",
          description: `${ids.length} applications deleted`,
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete applications",
        variant: "destructive",
      })
    }
  }

  const handleBulkStatusUpdate = async (ids: string[], status: string) => {
    try {
      if (isLocalMode) {
        for (const id of ids) {
          await fetch(`/api/local/applications/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          })
        }
        await fetchApplications()
        toast({
          title: "Success",
          description: `${ids.length} applications updated`,
        })
      } else {
        const { error } = await supabase.from("applications").update({ status }).in("id", ids)

        if (error) throw error

        setApplications(applications.map((app) => (ids.includes(app.id) ? { ...app, status: status as any } : app)))

        toast({
          title: "Success",
          description: `${ids.length} applications updated`,
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update applications",
        variant: "destructive",
      })
    }
  }

  const exportToCSV = () => {
    const headers = ["Company", "Role", "Status", "Applied On", "Notes", "Job URL", "Salary Range", "Location"]
    const csvContent = [
      headers.join(","),
      ...filteredApplications.map((app) =>
        [
          `"${(app.company || "").replace(/"/g, '""')}"`,
          `"${(app.role || "").replace(/"/g, '""')}"`,
          `"${app.status || ""}"`,
          `"${app.date_applied ? new Date(app.date_applied).toLocaleDateString() : ""}"`,
          `"${(app.notes || "").replace(/"/g, '""')}"`,
          `"${(app.job_url || "").replace(/"/g, '""')}"`,
          `"${(app.salary_range || "").replace(/"/g, '""')}"`,
          `"${(app.location || "").replace(/"/g, '""')}"`
        ].join(",")
      )
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `applications_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  const filteredApplications = applications.filter((app) => {
    try {
      const matchesSearch =
        (app.company || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.role || '').toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || app.status === statusFilter
      return matchesSearch && matchesStatus
    } catch (err) {
      console.error('[FILTER ERROR] app:', app, 'error:', err)
      return false
    }
  })

  if (loading) {
    return <div className="flex items-center justify-center h-[calc(100vh-100px)] text-muted-foreground animate-pulse">Loading applications...</div>
  }

  return (
    <div className="space-y-4 p-8 max-w-7xl mx-auto h-screen overflow-hidden flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Applications
          </h1>
          <p className="text-muted-foreground mt-1">Manage and track your job applications strategy</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all hover:scale-105">
              <Plus className="mr-2 h-4 w-4" />
              New Application
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] glass-card border-white/10">
            <DialogHeader>
              <DialogTitle>Add New Application</DialogTitle>
              <DialogDescription>Add a new job application to track your progress.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="company" className="text-right text-muted-foreground">
                  Company
                </Label>
                <Input
                  id="company"
                  className="col-span-3 bg-white/5 border-white/10"
                  value={newApplication.company}
                  onChange={(e) => setNewApplication({ ...newApplication, company: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right text-muted-foreground">
                  Role
                </Label>
                <Input
                  id="role"
                  className="col-span-3 bg-white/5 border-white/10"
                  value={newApplication.role}
                  onChange={(e) => setNewApplication({ ...newApplication, role: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right text-muted-foreground">
                  Status
                </Label>
                <Select
                  value={newApplication.status}
                  onValueChange={(value) => setNewApplication({ ...newApplication, status: value as any })}
                >
                  <SelectTrigger className="col-span-3 bg-white/5 border-white/10">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#09090b] border-white/10">
                    <SelectItem value="Applied">Applied</SelectItem>
                    <SelectItem value="Interviewing">Interviewing</SelectItem>
                    <SelectItem value="Offer">Offer</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right text-muted-foreground">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  className="col-span-3 bg-white/5 border-white/10"
                  value={newApplication.notes || ""}
                  onChange={(e) => setNewApplication({ ...newApplication, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button type="submit" onClick={handleAddApplication}>
                Add Application
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button variant="outline" onClick={exportToCSV} className="border-white/10">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] glass-card border-white/10">
          <DialogHeader>
            <DialogTitle>Edit Application</DialogTitle>
            <DialogDescription>Update your job application details.</DialogDescription>
          </DialogHeader>
          {editingApplication && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-company" className="text-muted-foreground">Company</Label>
                <Input
                  id="edit-company"
                  className="bg-white/5 border-white/10"
                  value={editingApplication.company}
                  onChange={(e) => setEditingApplication({ ...editingApplication, company: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-role" className="text-muted-foreground">Role</Label>
                <Input
                  id="edit-role"
                  className="bg-white/5 border-white/10"
                  value={editingApplication.role}
                  onChange={(e) => setEditingApplication({ ...editingApplication, role: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status" className="text-muted-foreground">Status</Label>
                <Select
                  value={editingApplication.status}
                  onValueChange={(value) => setEditingApplication({ ...editingApplication, status: value as any })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#09090b] border-white/10">
                    <SelectItem value="Applied">Applied</SelectItem>
                    <SelectItem value="Interviewing">Interviewing</SelectItem>
                    <SelectItem value="Offer">Offer</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-notes" className="text-muted-foreground">Notes</Label>
                <Textarea
                  id="edit-notes"
                  className="bg-white/5 border-white/10"
                  value={editingApplication.notes || ""}
                  onChange={(e) => setEditingApplication({ ...editingApplication, notes: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button type="submit" onClick={handleEditApplication}>
              Update Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card/30 p-4 rounded-xl border border-white/5 backdrop-blur-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search company or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 focus:border-primary/50 w-full"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-white/5 border-white/10">
              <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-[#09090b] border-white/10">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Applied">Applied</SelectItem>
              <SelectItem value="Interviewing">Interviewing</SelectItem>
              <SelectItem value="Offer">Offer</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          {statusFilter !== "all" && (
            <Button variant="ghost" size="icon" onClick={() => setStatusFilter("all")} className="text-muted-foreground hover:text-white">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <BulkOperations
        selectedItems={selectedApplications}
        onSelectAll={(selected) => {
          if (selected) {
            setSelectedApplications(applications.map((app) => app.id))
          } else {
            setSelectedApplications([])
          }
        }}
        onSelectItem={(id, selected) => {
          if (selected) {
            setSelectedApplications([...selectedApplications, id])
          } else {
            setSelectedApplications(selectedApplications.filter((item) => item !== id))
          }
        }}
        onBulkDelete={handleBulkDelete}
        onBulkStatusUpdate={handleBulkStatusUpdate}
        onBulkEmailSend={async (ids) => {
          toast({
            title: "Feature Coming Soon",
            description: "Email integration will be available soon",
          })
        }}
        totalItems={applications.length}
        itemType="applications"
      />

      {/* Applications Table - Glassmorphism */}
      <Card className="glass-card flex-1 min-h-0 overflow-hidden border-white/10 bg-gradient-to-br from-card/50 to-card/10">
        <CardHeader className="border-b border-white/5 bg-white/5 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              <CardTitle>All Applications</CardTitle>
              <Badge variant="secondary" className="bg-white/10 text-muted-foreground">{filteredApplications.length}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-hidden">
          {filteredApplications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <p className="text-xl font-medium text-foreground mb-2">No applications found</p>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Get started by adding your first job application to track your progress.
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)} className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                Add Application
              </Button>
            </div>
          ) : (
            <div className="overflow-auto h-full min-h-0">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={
                          selectedApplications.length > 0 && selectedApplications.length < applications.length
                            ? "indeterminate"
                            : selectedApplications.length === applications.length && applications.length > 0
                        }
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedApplications(applications.map((app) => app.id))
                          } else {
                            setSelectedApplications([])
                          }
                        }}
                        className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">Company</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Role</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Applied On</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Notes</TableHead>
                    <TableHead className="text-right text-muted-foreground font-medium">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((application) => (
                    <TableRow key={application.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                      <TableCell>
                        <Checkbox
                          checked={selectedApplications.includes(application.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedApplications([...selectedApplications, application.id])
                            } else {
                              setSelectedApplications(selectedApplications.filter((id) => id !== application.id))
                            }
                          }}
                          className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">{application.company}</TableCell>
                      <TableCell className="text-muted-foreground group-hover:text-foreground transition-colors">{application.role}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${statusConfig[application.status as keyof typeof statusConfig]?.color} capitalize shadow-sm`}>
                          {application.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{(application as any).date_applied ? new Date((application as any).date_applied).toLocaleDateString() : "-"}</TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground text-sm italic">{application.notes || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-white/10 hover:text-primary"
                            onClick={() => {
                              setEditingApplication(application)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500"
                            onClick={() => handleDeleteApplication(application.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
