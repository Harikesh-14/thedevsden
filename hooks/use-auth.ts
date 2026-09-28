"use client"

import { getCurrentUser, type User } from "@/lib/auth"
import { useEffect, useState } from "react"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        const user = await getCurrentUser()
        setUser(user)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  return {
    user,
    loading,
    isAuthenticated: !!user,
  }
}
