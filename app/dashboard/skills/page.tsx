"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import { Plus, Brain, Edit, Trash2, Upload } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import type { Skill } from "@/lib/supabase"

const aiRecommendations = [
  {
    skill: "AWS",
    reason: "High demand in your target companies",
    priority: "High",
    resources: ["AWS Certified Solutions Architect", "A Cloud Guru"],
  },
  {
    skill: "Docker",
    reason: "Essential for DevOps roles",
    priority: "Medium",
    resources: ["Docker Official Tutorial", "Kubernetes Basics"],
  },
  {
    skill: "GraphQL",
    reason: "Emerging technology in your field",
    priority: "Low",
    resources: ["GraphQL Official Docs", "Apollo GraphQL"],
  },
]

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
  const [newSkill, setNewSkill] = useState({
    skill_name: "",
    proficiency: 0,
    target_proficiency: 0,
  })

  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      fetchSkills()
    }
  }, [user])

  const fetchSkills = async () => {
    try {
      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setSkills(data || [])
    } catch (error: any) {
      console.error("Error fetching skills:", error)
      toast({
        title: "Error",
        description: "Failed to fetch skills",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddSkill = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("skills")
        .insert({
          ...newSkill,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error

      setSkills([data, ...skills])
      setNewSkill({ skill_name: "", proficiency: 0, target_proficiency: 0 })
      setIsAddDialogOpen(false)

      toast({
        title: "Success",
        description: "Skill added successfully",
      })
    } catch (error: any) {
      console.error("Error adding skill:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add skill",
        variant: "destructive",
      })
    }
  }

  const handleUpdateSkill = async () => {
    if (!editingSkill) return

    try {
      const { data, error } = await supabase
        .from("skills")
        .update({
          skill_name: editingSkill.skill_name,
          proficiency: editingSkill.proficiency,
          target_proficiency: editingSkill.target_proficiency,
        })
        .eq("id", editingSkill.id)
        .select()
        .single()

      if (error) throw error

      setSkills(skills.map((skill) => (skill.id === editingSkill.id ? data : skill)))
      setEditingSkill(null)

      toast({
        title: "Success",
        description: "Skill updated successfully",
      })
    } catch (error: any) {
      console.error("Error updating skill:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update skill",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSkill = async (skillId: string) => {
    try {
      const { error } = await supabase.from("skills").delete().eq("id", skillId)

      if (error) throw error

      setSkills(skills.filter((skill) => skill.id !== skillId))

      toast({
        title: "Success",
        description: "Skill deleted successfully",
      })
    } catch (error: any) {
      console.error("Error deleting skill:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete skill",
        variant: "destructive",
      })
    }
  }

  const radarData = skills.map((skill) => ({
    skill: skill.skill_name,
    current: skill.proficiency,
    target: skill.target_proficiency || skill.proficiency,
  }))

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Skill Development</h1>
        <div className="flex gap-2">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Skill
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] dark:bg-gray-800 dark:border-gray-700">
              <DialogHeader>
                <DialogTitle>Add New Skill</DialogTitle>
                <DialogDescription>Add a skill to track your proficiency and set targets.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="skill-name">Skill Name</Label>
                  <Input
                    id="skill-name"
                    value={newSkill.skill_name}
                    onChange={(e) => setNewSkill({ ...newSkill, skill_name: e.target.value })}
                    placeholder="e.g., React, Python, AWS"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proficiency">Current Proficiency (0-100)</Label>
                  <Input
                    id="proficiency"
                    type="number"
                    min="0"
                    max="100"
                    value={newSkill.proficiency}
                    onChange={(e) => setNewSkill({ ...newSkill, proficiency: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target">Target Proficiency (0-100)</Label>
                  <Input
                    id="target"
                    type="number"
                    min="0"
                    max="100"
                    value={newSkill.target_proficiency}
                    onChange={(e) =>
                      setNewSkill({ ...newSkill, target_proficiency: Number.parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddSkill}>Add Skill</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Upload Resume
          </Button>
        </div>
      </div>

      {/* Skills Overview */}
      {skills.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Skills Radar</CardTitle>
              <CardDescription>Current vs Target skill levels</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: "var(--foreground)", fontSize: 12 }} />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                  />
                  <Radar name="Current" dataKey="current" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Radar name="Target" dataKey="target" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                </RadarChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm">Current Level</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm">Target Level</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle>Skill Gap Analysis</CardTitle>
              <CardDescription>Areas that need improvement</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={radarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="skill" stroke="var(--foreground)" />
                  <YAxis stroke="var(--foreground)" />
                  <Tooltip contentStyle={{ backgroundColor: "var(--background)", border: "1px solid var(--border)" }} />
                  <Bar dataKey="current" fill="#3b82f6" name="Current" />
                  <Bar dataKey="target" fill="#10b981" name="Target" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Skills List */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle>Skill Progress</CardTitle>
          <CardDescription>Track your learning journey</CardDescription>
        </CardHeader>
        <CardContent>
          {skills.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No skills added yet</p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Skill
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {skills.map((skill) => (
                <div key={skill.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{skill.skill_name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {skill.proficiency}% / {skill.target_proficiency || skill.proficiency}%
                      </span>
                      <Badge
                        variant={
                          skill.proficiency >= (skill.target_proficiency || skill.proficiency) ? "default" : "secondary"
                        }
                      >
                        {skill.proficiency >= (skill.target_proficiency || skill.proficiency)
                          ? "Target Reached"
                          : "In Progress"}
                      </Badge>
                      <Button variant="outline" size="sm" onClick={() => setEditingSkill(skill)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteSkill(skill.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Progress value={skill.proficiency} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Current: {skill.proficiency}%</span>
                      <span>Target: {skill.target_proficiency || skill.proficiency}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Skill Dialog */}
      <Dialog open={!!editingSkill} onOpenChange={() => setEditingSkill(null)}>
        <DialogContent className="sm:max-w-[425px] dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle>Edit Skill</DialogTitle>
            <DialogDescription>Update your skill proficiency and target.</DialogDescription>
          </DialogHeader>
          {editingSkill && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-skill-name">Skill Name</Label>
                <Input
                  id="edit-skill-name"
                  value={editingSkill.skill_name}
                  onChange={(e) => setEditingSkill({ ...editingSkill, skill_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-proficiency">Current Proficiency (0-100)</Label>
                <Input
                  id="edit-proficiency"
                  type="number"
                  min="0"
                  max="100"
                  value={editingSkill.proficiency}
                  onChange={(e) =>
                    setEditingSkill({ ...editingSkill, proficiency: Number.parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-target">Target Proficiency (0-100)</Label>
                <Input
                  id="edit-target"
                  type="number"
                  min="0"
                  max="100"
                  value={editingSkill.target_proficiency || 0}
                  onChange={(e) =>
                    setEditingSkill({ ...editingSkill, target_proficiency: Number.parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleUpdateSkill}>Update Skill</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Recommendations */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Skill Recommendations
          </CardTitle>
          <CardDescription>Personalized suggestions based on your career goals and market trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiRecommendations.map((rec, index) => (
              <div key={index} className="border rounded-lg p-4 dark:border-gray-600">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium">{rec.skill}</h3>
                  <Badge
                    variant={
                      rec.priority === "High" ? "destructive" : rec.priority === "Medium" ? "default" : "secondary"
                    }
                  >
                    {rec.priority} Priority
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{rec.reason}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium mb-2">Recommended Resources:</p>
                    <div className="flex flex-wrap gap-2">
                      {rec.resources.map((resource, idx) => (
                        <Badge key={idx} variant="outline" className="cursor-pointer">
                          {resource}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setNewSkill({ skill_name: rec.skill, proficiency: 0, target_proficiency: 70 })
                      setIsAddDialogOpen(true)
                    }}
                  >
                    Add Skill
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
