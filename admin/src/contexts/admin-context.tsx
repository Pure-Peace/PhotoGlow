'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface AdminUser {
  id: string
  email: string
  name: string
  role: string
}

interface AdminContextType {
  admin: AdminUser | null
  setAdmin: (admin: AdminUser | null) => void
  isLoading: boolean
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCurrentAdmin = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setAdmin(data.admin)
        }
      } catch (error) {
        console.error('Error fetching current admin:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCurrentAdmin()
  }, [])

  return (
    <AdminContext.Provider value={{ admin, setAdmin, isLoading }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
} 
