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
import { Plus, Brain, Edit, Trash2, Upload, TrendingUp, Target, Sparkles, BookOpen } from "lucide-react"
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
    category: "Cloud",
  },
  {
    skill: "Docker",
    reason: "Essential for DevOps roles",
    priority: "Medium",
    resources: ["Docker Official Tutorial", "Kubernetes Basics"],
    category: "DevOps",
  },
  {
    skill: "GraphQL",
    reason: "Emerging technology in your field",
    priority: "Low",
    resources: ["GraphQL Official Docs", "Apollo GraphQL"],
    category: "Full Stack",
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

  const { user, isLocalMode } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user && !isLocalMode) {
      fetchSkills()
    } else {
      setLoading(false)
    }
  }, [user, isLocalMode])

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
    return <div className="flex items-center justify-center h-[calc(100vh-100px)] text-muted-foreground animate-pulse">Loading skills...</div>
  }

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto min-h-[calc(100vh-theme(spacing.4))]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent flex items-center gap-2">
            Skill Development <TrendingUp className="h-6 w-6 text-primary animate-pulse" />
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">Track your growth and bridge the gap to your dream role</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all hover:scale-105">
                <Plus className="mr-2 h-4 w-4" />
                Add Skill
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] glass-card border-white/10">
              <DialogHeader>
                <DialogTitle>Add New Skill</DialogTitle>
                <DialogDescription>Add a skill to track your proficiency and set targets.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="skill-name" className="text-muted-foreground">Skill Name</Label>
                  <Input
                    id="skill-name"
                    value={newSkill.skill_name}
                    onChange={(e) => setNewSkill({ ...newSkill, skill_name: e.target.value })}
                    placeholder="e.g., React, Python, AWS"
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="proficiency" className="text-muted-foreground">Current Proficiency (0-100)</Label>
                  <Input
                    id="proficiency"
                    type="number"
                    min="0"
                    max="100"
                    value={newSkill.proficiency}
                    onChange={(e) => setNewSkill({ ...newSkill, proficiency: Number.parseInt(e.target.value) || 0 })}
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target" className="text-muted-foreground">Target Proficiency (0-100)</Label>
                  <Input
                    id="target"
                    type="number"
                    min="0"
                    max="100"
                    value={newSkill.target_proficiency}
                    onChange={(e) =>
                      setNewSkill({ ...newSkill, target_proficiency: Number.parseInt(e.target.value) || 0 })
                    }
                    className="bg-white/5 border-white/10"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddSkill}>Add Skill</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" className="border-white/10 hover:bg-white/5 text-muted-foreground hover:text-white transition-colors">
            <Upload className="mr-2 h-4 w-4" />
            Parse from Resume
          </Button>
        </div>
      </div>

      {/* Skills Overview */}
      {skills.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="glass-card border-white/10 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Target className="h-24 w-24 text-primary" />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radar className="h-5 w-5 text-primary" />
                Skills Radar
              </CardTitle>
              <CardDescription>Visualizing your current vs target skill landscape</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full items-center justify-center flex">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="skill" tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }} />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
                      stroke="rgba(255,255,255,0.1)"
                    />
                    <Radar name="Current" dataKey="current" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.4} />
                    <Radar name="Target" dataKey="target" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(10, 10, 15, 0.9)",
                        backdropFilter: "blur(4px)",
                        borderColor: "rgba(255,255,255,0.1)",
                        color: "#fff"
                      }}
                      itemStyle={{ color: "#fff" }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary/60" />
                  <span className="text-sm text-muted-foreground">Current Level</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500/40" />
                  <span className="text-sm text-muted-foreground">Target Level</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <TrendingUp className="h-24 w-24 text-emerald-500" />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                Skill Gap Analysis
              </CardTitle>
              <CardDescription>Identifying areas with the biggest growth opportunity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={radarData} layout="vertical" margin={{ left: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" domain={[0, 100]} stroke="rgba(255,255,255,0.2)" fontSize={12} />
                    <YAxis dataKey="skill" type="category" stroke="rgba(255,255,255,0.7)" width={80} fontSize={12} />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{
                        backgroundColor: "rgba(10, 10, 15, 0.9)",
                        backdropFilter: "blur(4px)",
                        borderColor: "rgba(255,255,255,0.1)",
                        color: "#fff"
                      }}
                    />
                    <Bar dataKey="current" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Current" barSize={20} fillOpacity={0.8} />
                    <Bar dataKey="target" fill="#10b981" radius={[0, 4, 4, 0]} name="Target" barSize={20} fillOpacity={0.8} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="glass-card border-white/10 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Start Your Journey</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Add skills to visualize your proficiency and identify areas for growth.
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Skill
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Detailed Skills List */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-400" />
            Detailed Skill Progress
          </CardTitle>
          <CardDescription>Manage and update your individual skill metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {skills.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No skills added yet</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {skills.map((skill) => (
                <div key={skill.id} className="p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/[0.07] transition-all group">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">{skill.skill_name}</h3>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-primary" onClick={() => setEditingSkill(skill)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-red-500" onClick={() => handleDeleteSkill(skill.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Proficiency</span>
                    <span className="font-medium">{skill.proficiency}%</span>
                  </div>
                  <Progress value={skill.proficiency} className="h-1.5 bg-white/10 mb-4" indicatorClassName={skill.proficiency >= (skill.target_proficiency || skill.proficiency) ? "bg-green-500" : "bg-primary"} />

                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Target className="h-3 w-3" />
                      <span>Target: {skill.target_proficiency}%</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-2 py-0.5 h-auto border-0 ${skill.proficiency >= (skill.target_proficiency || skill.proficiency)
                          ? "bg-green-500/20 text-green-400"
                          : "bg-blue-500/20 text-blue-400"
                        }`}
                    >
                      {skill.proficiency >= (skill.target_proficiency || skill.proficiency) ? "Achieved" : "In Progress"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Skill Dialog */}
      <Dialog open={!!editingSkill} onOpenChange={() => setEditingSkill(null)}>
        <DialogContent className="sm:max-w-[425px] glass-card border-white/10">
          <DialogHeader>
            <DialogTitle>Edit Skill</DialogTitle>
            <DialogDescription>Update your skill proficiency and target.</DialogDescription>
          </DialogHeader>
          {editingSkill && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-skill-name" className="text-muted-foreground">Skill Name</Label>
                <Input
                  id="edit-skill-name"
                  value={editingSkill.skill_name}
                  onChange={(e) => setEditingSkill({ ...editingSkill, skill_name: e.target.value })}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-proficiency" className="text-muted-foreground">Current Proficiency (0-100)</Label>
                <Input
                  id="edit-proficiency"
                  type="number"
                  min="0"
                  max="100"
                  value={editingSkill.proficiency}
                  onChange={(e) =>
                    setEditingSkill({ ...editingSkill, proficiency: Number.parseInt(e.target.value) || 0 })
                  }
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-target" className="text-muted-foreground">Target Proficiency (0-100)</Label>
                <Input
                  id="edit-target"
                  type="number"
                  min="0"
                  max="100"
                  value={editingSkill.target_proficiency || 0}
                  onChange={(e) =>
                    setEditingSkill({ ...editingSkill, target_proficiency: Number.parseInt(e.target.value) || 0 })
                  }
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingSkill(null)}>Cancel</Button>
            <Button onClick={handleUpdateSkill}>Update Skill</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Recommendations */}
      <Card className="glass-card border-white/10 bg-gradient-to-br from-violet-500/5 to-purple-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            AI Skill Recommendations
          </CardTitle>
          <CardDescription>Personalized suggestions based on your career goals and market trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {aiRecommendations.map((rec, index) => (
              <div key={index} className="flex flex-col p-5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity scale-150 rotate-12">
                  <Sparkles className="h-24 w-24 text-white" />
                </div>
                <div className="flex items-start justify-between mb-3 z-10">
                  <div>
                    <h3 className="font-bold text-lg">{rec.skill}</h3>
                    <span className="text-xs text-muted-foreground">{rec.category}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`
                      ${rec.priority === "High" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                        rec.priority === "Medium" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                          "bg-green-500/10 text-green-500 border-green-500/20"}
                    `}
                  >
                    {rec.priority} Priority
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4 z-10 flex-grow leading-relaxed">{rec.reason}</p>

                <div className="space-y-3 z-10">
                  <div className="flex flex-wrap gap-1.5">
                    {rec.resources.map((resource, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-1 rounded bg-white/5 border border-white/5 text-muted-foreground">
                        {resource}
                      </span>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    className="w-full bg-white/10 hover:bg-white/20 border border-white/5 text-foreground shadow-none"
                    onClick={() => {
                      setNewSkill({ skill_name: rec.skill, proficiency: 0, target_proficiency: 70 })
                      setIsAddDialogOpen(true)
                    }}
                  >
                    <Plus className="mr-2 h-3.5 w-3.5" />
                    Add to Skills
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
