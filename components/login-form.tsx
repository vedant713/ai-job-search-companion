"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-provider"
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react"

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("login")
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  })

  const { signIn, signUp } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginData.email || !loginData.password) return

    setIsLoading(true)
    try {
      await signIn(loginData.email, loginData.password)
    } catch (error) {
      // Error is handled in the auth provider
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signupData.email || !signupData.password || !signupData.confirmPassword) return

    if (signupData.password !== signupData.confirmPassword) {
      return
    }

    if (signupData.password.length < 6) {
      return
    }

    setIsLoading(true)
    try {
      await signUp(signupData.email, signupData.password)
      setSignupData({ email: "", password: "", confirmPassword: "" })
    } catch (error) {
      // Error is handled in the auth provider
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full p-6 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          {activeTab === "login" ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {activeTab === "login"
            ? "Enter your credentials to access your workspace"
            : "Get started with your AI career companion"}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/5 p-1 rounded-xl">
          <TabsTrigger
            value="login"
            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all"
          >
            Login
          </TabsTrigger>
          <TabsTrigger
            value="signup"
            className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all"
          >
            Sign Up
          </TabsTrigger>
        </TabsList>

        <TabsContent value="login" className="space-y-4 pt-4 animate-in slide-in-from-right-4 duration-300">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email" className="text-gray-300">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="Ex: your@email.com"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password" className="text-gray-300">Password</Label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 h-10 text-base font-medium transition-all hover:scale-[1.02]"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <span className="flex items-center">Sign In <ArrowRight className="ml-2 h-4 w-4" /></span>}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="signup" className="space-y-4 pt-4 animate-in slide-in-from-left-4 duration-300">
          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-email" className="text-gray-300">Email</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="Ex: your@email.com"
                value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password" className="text-gray-300">Password</Label>
              <div className="relative">
                <Input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password (min 6 chars)"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  required
                  minLength={6}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-gray-300">Confirm Password</Label>
              <Input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={signupData.confirmPassword}
                onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary/50 focus:ring-primary/20"
              />
            </div>
            {signupData.password !== signupData.confirmPassword && signupData.confirmPassword && (
              <p className="text-sm text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20">Passwords do not match</p>
            )}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 h-10 text-base font-medium transition-all hover:scale-[1.02]"
              disabled={isLoading || signupData.password !== signupData.confirmPassword || signupData.password.length < 6}
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}

