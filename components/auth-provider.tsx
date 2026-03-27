"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

interface MockUser {
  id: string
  email: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
  }
}

interface AuthContextType {
  user: MockUser | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  isLocalMode: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLocalMode, setIsLocalMode] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await fetch("/api/local/db", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "init" }),
        })

        if (response.ok) {
          const data = await response.json()
          setIsLocalMode(true)
          
          if (data.profile) {
            setUser({
              id: data.profile.id,
              email: data.profile.email,
              user_metadata: {
                full_name: data.profile.full_name,
                avatar_url: data.profile.avatar_url,
              },
            })
          } else {
            setUser({
              id: data.userId,
              email: "local@user.com",
              user_metadata: {
                full_name: "Local User",
              },
            })
          }
        }
      } catch (error) {
        console.error("Error initializing local auth:", error)
        setIsLocalMode(true)
        setUser({
          id: "local-user-id",
          email: "local@user.com",
          user_metadata: {
            full_name: "Local User",
          },
        })
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const signUp = async (email: string, password: string) => {
    try {
      toast({
        title: "Local Mode",
        description: "Sign up is disabled in local mode. Using default local user.",
      })
    } catch (error: any) {
      console.error("Signup error:", error)
      toast({
        title: "Signup Failed",
        description: error.message || "An error occurred during signup",
        variant: "destructive",
      })
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/local/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "getProfile" }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.profile) {
          setUser({
            id: data.profile.id,
            email: data.profile.email,
            user_metadata: {
              full_name: data.profile.full_name,
              avatar_url: data.profile.avatar_url,
            },
          })
        }
      }

      router.push("/dashboard")

      toast({
        title: "Welcome back!",
        description: "You are using local mode.",
      })
    } catch (error: any) {
      console.error("Signin error:", error)
      toast({
        title: "Login Failed",
        description: error.message || "An error occurred",
        variant: "destructive",
      })
      throw error
    }
  }

  const signOut = async () => {
    try {
      setUser(null)
      router.push("/")

      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      })
    } catch (error: any) {
      console.error("Signout error:", error)
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      })
    }
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    isLocalMode,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
