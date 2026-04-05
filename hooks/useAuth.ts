"use client"
import { createClient } from "@supabase/supabase-js"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"

const supabase = createClient(supabaseUrl, supabaseKey)

interface User {
  id: string
  email: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (supabaseUrl === "https://placeholder.supabase.co" || supabaseKey === "placeholder-key") {
      // Si Supabase n'est pas configuré, simuler un utilisateur connecté pour le développement
      setUser({
        id: "dev-user",
        email: "dev@example.com",
      })
      setLoading(false)
      return
    }

    // Vérifier la session actuelle
    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || "",
          })
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de la session:", error)
      }
      setLoading(false)
    }

    getSession()

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || "",
        })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    if (supabaseUrl === "https://placeholder.supabase.co") {
      // Mode développement - simuler une connexion réussie
      setUser({
        id: "dev-user",
        email: email,
      })
      return { data: { user: { id: "dev-user", email } }, error: null }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signUp = async (email: string, password: string) => {
    if (supabaseUrl === "https://placeholder.supabase.co") {
      // Mode développement - simuler une inscription réussie
      setUser({
        id: "dev-user",
        email: email,
      })
      return { data: { user: { id: "dev-user", email } }, error: null }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  }

  const signOut = async () => {
    if (supabaseUrl === "https://placeholder.supabase.co") {
      setUser(null)
      router.push("/login")
      return
    }

    await supabase.auth.signOut()
    router.push("/login")
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  }
}