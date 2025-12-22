"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/login-form"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Briefcase, Target, CheckSquare, MessageSquare } from "lucide-react"

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">AI Job Assistant</h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
              Your intelligent companion for job search and career management
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Features */}
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Track Applications</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Manage all your job applications in one place
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                        <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Skill Development</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Track and improve your professional skills
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                        <CheckSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Task Management</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Stay organized with job search tasks</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                        <MessageSquare className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">AI Assistant</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Get personalized career advice and tips
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Login Form */}
            <div className="max-w-md mx-auto w-full">
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
