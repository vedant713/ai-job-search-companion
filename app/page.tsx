"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/login-form"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Briefcase, Target, CheckSquare, MessageSquare, Sparkles } from "lucide-react"

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (user && !loading) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (loading || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05050a] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            </div>
          </div>
          <p className="text-muted-foreground animate-pulse">Loading experience...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-[#05050a] text-white overflow-hidden relative selection:bg-primary/20 selection:text-primary">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col justify-center">
        <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">

          {/* Left Column: Content */}
          <div className="space-y-8 text-center lg:text-left animate-in slide-in-from-left-6 fade-in duration-700">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-primary-foreground/80 backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>AI-Powered Career Growth</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-br from-white via-white/90 to-white/50 bg-clip-text text-transparent pb-2">
                Your Intelligent <br />
                <span className="text-primary">Career Companion</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Streamline your job search, master new skills, and organize your applications with the power of advanced AI.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors group">
                <Briefcase className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-white mb-1">Smart Tracking</h3>
                <p className="text-sm text-muted-foreground">Manage applications efficiently</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors group">
                <Target className="w-8 h-8 text-green-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-white mb-1">Skill Matrix</h3>
                <p className="text-sm text-muted-foreground">Visualize your growth path</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors group">
                <MessageSquare className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-white mb-1">AI Insights</h3>
                <p className="text-sm text-muted-foreground">Get personalized advice</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors group">
                <CheckSquare className="w-8 h-8 text-orange-400 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-white mb-1">Productivity</h3>
                <p className="text-sm text-muted-foreground">Never miss a deadline</p>
              </div>
            </div>
          </div>

          {/* Right Column: Login Form */}
          <div className="w-full max-w-md mx-auto lg:ml-auto animate-in slide-in-from-right-6 fade-in duration-700 delay-200">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-30 animate-pulse"></div>
              <div className="relative bg-[#0A0A0F]/80 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl overflow-hidden p-1">
                <LoginForm />
              </div>
            </div>

            {/* Trust badges or additional info */}
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Trusted by developers worldwide
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

