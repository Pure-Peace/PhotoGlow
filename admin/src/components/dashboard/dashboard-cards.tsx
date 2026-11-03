'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatNumber } from '@/lib/utils'
import { Users, ImageIcon, MessageSquare, TrendingUp } from 'lucide-react'

interface DashboardStats {
  users: {
    total: number
    active: number
    new: number
    byStatus: Array<{ status: string; count: number }>
  }
  content: {
    posts: {
      total: number
      new: number
    }
    comments: {
      total: number
      new: number
    }
  }
}

export function DashboardCards() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats')
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats')
        }
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="grid gap-4 px-4 md:grid-cols-2 lg:grid-cols-4 lg:px-6">
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <CardTitle className="text-base">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-12 w-full animate-pulse rounded-md bg-muted" />
          ) : (
            <>
              <div className="text-2xl font-bold">{formatNumber(stats?.users.total || 0)}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500 font-medium">+{formatNumber(stats?.users.new || 0)}</span> new users in the last 30 days
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <CardTitle className="text-base">Active Users</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-12 w-full animate-pulse rounded-md bg-muted" />
          ) : (
            <>
              <div className="text-2xl font-bold">{formatNumber(stats?.users.active || 0)}</div>
              <p className="text-xs text-muted-foreground">
                Active in the last 30 days
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <CardTitle className="text-base">Total Posts</CardTitle>
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-12 w-full animate-pulse rounded-md bg-muted" />
          ) : (
            <>
              <div className="text-2xl font-bold">{formatNumber(stats?.content.posts.total || 0)}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500 font-medium">+{formatNumber(stats?.content.posts.new || 0)}</span> new posts in the last 30 days
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          <CardTitle className="text-base">Total Comments</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-12 w-full animate-pulse rounded-md bg-muted" />
          ) : (
            <>
              <div className="text-2xl font-bold">{formatNumber(stats?.content.comments.total || 0)}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500 font-medium">+{formatNumber(stats?.content.comments.new || 0)}</span> new comments in the last 30 days
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 
