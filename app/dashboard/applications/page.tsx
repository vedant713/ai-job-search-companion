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
import { Plus, Edit, Trash2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { BulkOperations } from "@/components/bulk-operations"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import type { Application } from "@/lib/supabase"

const statusColors = {
  Applied: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Interviewing: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  Offer: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
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

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      fetchApplications()
    }
  }, [user])

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setApplications(data || [])
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
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("applications")
        .insert({
          ...newApplication,
          user_id: user.id,
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
    if (!editingApplication || !user) return

    try {
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
        .eq("user_id", user.id)
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
    if (!user) return

    try {
      const { error } = await supabase.from("applications").delete().eq("id", id).eq("user_id", user.id)

      if (error) throw error

      setApplications(applications.filter((app) => app.id !== id))

      toast({
        title: "Success",
        description: "Application deleted successfully",
      })
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
      const { error } = await supabase.from("applications").delete().in("id", ids)

      if (error) throw error

      setApplications(applications.filter((app) => !ids.includes(app.id)))
      setSelectedApplications([])

      toast({
        title: "Success",
        description: `${ids.length} applications deleted`,
      })
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
      const { error } = await supabase.from("applications").update({ status }).in("id", ids)

      if (error) throw error

      setApplications(applications.map((app) => (ids.includes(app.id) ? { ...app, status: status as any } : app)))

      toast({
        title: "Success",
        description: `${ids.length} applications updated`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update applications",
        variant: "destructive",
      })
    }
  }

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.role.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || app.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Job Applications</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Application
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] dark:bg-gray-800 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle>Add New Application</DialogTitle>
              <DialogDescription>Add a new job application to track your progress.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="company" className="text-right">
                  Company
                </Label>
                <Input
                  id="company"
                  className="col-span-3"
                  value={newApplication.company}
                  onChange={(e) => setNewApplication({ ...newApplication, company: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Input
                  id="role"
                  className="col-span-3"
                  value={newApplication.role}
                  onChange={(e) => setNewApplication({ ...newApplication, role: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Select
                  value={newApplication.status}
                  onValueChange={(value) => setNewApplication({ ...newApplication, status: value as any })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Applied">Applied</SelectItem>
                    <SelectItem value="Interviewing">Interviewing</SelectItem>
                    <SelectItem value="Offer">Offer</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  className="col-span-3"
                  value={newApplication.notes || ""}
                  onChange={(e) => setNewApplication({ ...newApplication, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddApplication}>
                Add Application
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle>Edit Application</DialogTitle>
            <DialogDescription>Update your job application details.</DialogDescription>
          </DialogHeader>
          {editingApplication && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-company" className="text-right">
                  Company
                </Label>
                <Input
                  id="edit-company"
                  className="col-span-3"
                  value={editingApplication.company}
                  onChange={(e) => setEditingApplication({ ...editingApplication, company: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-role" className="text-right">
                  Role
                </Label>
                <Input
                  id="edit-role"
                  className="col-span-3"
                  value={editingApplication.role}
                  onChange={(e) => setEditingApplication({ ...editingApplication, role: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">
                  Status
                </Label>
                <Select
                  value={editingApplication.status}
                  onValueChange={(value) => setEditingApplication({ ...editingApplication, status: value as any })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Applied">Applied</SelectItem>
                    <SelectItem value="Interviewing">Interviewing</SelectItem>
                    <SelectItem value="Offer">Offer</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-notes" className="text-right">
                  Notes
                </Label>
                <Textarea
                  id="edit-notes"
                  className="col-span-3"
                  value={editingApplication.notes || ""}
                  onChange={(e) => setEditingApplication({ ...editingApplication, notes: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="submit" onClick={handleEditApplication}>
              Update Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Input
          placeholder="Search applications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Applied">Applied</SelectItem>
            <SelectItem value="Interviewing">Interviewing</SelectItem>
            <SelectItem value="Offer">Offer</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
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

      {/* Applications Table */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Applications ({filteredApplications.length})</CardTitle>
          <CardDescription>Manage your job applications and track their progress</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredApplications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No applications found</p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Application
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="dark:border-gray-700">
                  <TableHead>
                    <Checkbox
                      checked={selectedApplications.length === applications.length && applications.length > 0}
                      indeterminate={
                        selectedApplications.length > 0 && selectedApplications.length < applications.length
                          ? true
                          : undefined
                      }
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedApplications(applications.map((app) => app.id))
                        } else {
                          setSelectedApplications([])
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Applied</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((application) => (
                  <TableRow key={application.id} className="dark:border-gray-700">
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
                      />
                    </TableCell>
                    <TableCell className="font-medium">{application.company}</TableCell>
                    <TableCell>{application.role}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[application.status as keyof typeof statusColors]}>
                        {application.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(application.date_applied).toLocaleDateString()}</TableCell>
                    <TableCell className="max-w-xs truncate">{application.notes}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingApplication(application)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteApplication(application.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
