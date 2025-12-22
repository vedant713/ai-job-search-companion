"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

import { useRouter } from "next/navigation"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)
      setUser(session?.user ?? null)
      setLoading(false)

      if (event === "SIGNED_IN") {
        // Create profile if it doesn't exist
        if (session?.user) {
          const { error } = await supabase.from("profiles").upsert({
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || "",
            updated_at: new Date().toISOString(),
          })

          if (error) {
            console.error("Error creating profile:", error)
          }
        }
      } else if (event === "SIGNED_OUT") {
        router.push("/")
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) throw error

      toast({
        title: "Success!",
        description: "Please check your email to confirm your account.",
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
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.push("/dashboard")

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      })
    } catch (error: any) {
      console.error("Signin error:", error)
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      })
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

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
