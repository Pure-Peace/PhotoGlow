import { NextRequest, NextResponse } from 'next/server'
import { photoglowDb } from '@/lib/db'
import { getCurrentAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Check if admin is authenticated
    const admin = await getCurrentAdmin()
    if (!admin) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'
    
    let formattedData = []
    
    if (period === 'week') {
      // Last 7 days daily growth
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      // Generate all days in the range
      const days = generateDateRange(sevenDaysAgo, new Date(), 'day')
      
      // Get user counts by date
      const userCounts = await photoglowDb.user.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: { gte: sevenDaysAgo }
        },
        _count: {
          id: true
        }
      })
      
      // Convert to date-based map for easier lookup
      const countsMap = new Map()
      userCounts.forEach(item => {
        const date = formatDateString(item.createdAt)
        countsMap.set(date, (countsMap.get(date) || 0) + item._count.id)
      })
      
      // Format data with all days (including zero counts)
      formattedData = days.map(date => ({
        date,
        users: countsMap.get(date) || 0
      }))
    } else if (period === 'month') {
      // Last 30 days daily growth
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      // Generate all days in the range
      const days = generateDateRange(thirtyDaysAgo, new Date(), 'day')
      
      // Get user counts by date
      const userCounts = await photoglowDb.user.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: { gte: thirtyDaysAgo }
        },
        _count: {
          id: true
        }
      })
      
      // Convert to date-based map for easier lookup
      const countsMap = new Map()
      userCounts.forEach(item => {
        const date = formatDateString(item.createdAt)
        countsMap.set(date, (countsMap.get(date) || 0) + item._count.id)
      })
      
      // Format data with all days (including zero counts)
      formattedData = days.map(date => ({
        date,
        users: countsMap.get(date) || 0
      }))
    } else if (period === 'year') {
      // Last 12 months monthly growth
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
      
      // Generate all months in the range
      const months = generateDateRange(oneYearAgo, new Date(), 'month')
      
      // Get user counts by month
      const userCounts = await photoglowDb.user.groupBy({
        by: ['createdAt'],
        where: {
          createdAt: { gte: oneYearAgo }
        },
        _count: {
          id: true
        }
      })
      
      // Convert to month-based map for easier lookup
      const countsMap = new Map()
      userCounts.forEach(item => {
        const monthStr = formatDateString(item.createdAt, 'month')
        countsMap.set(monthStr, (countsMap.get(monthStr) || 0) + item._count.id)
      })
      
      // Format data with all months (including zero counts)
      formattedData = months.map(month => ({
        date: month,
        users: countsMap.get(month) || 0
      }))
    } else {
      // All time yearly growth
      const firstUser = await photoglowDb.user.findFirst({
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true }
      })
      
      const startYear = firstUser ? new Date(firstUser.createdAt).getFullYear() : new Date().getFullYear()
      const currentYear = new Date().getFullYear()
      
      // Generate array of years
      const years = []
      for (let year = startYear; year <= currentYear; year++) {
        years.push(`${year}-01-01`) // January 1st of each year
      }
      
      // Get user counts for each year
      const userCountsByYear = []
      
      for (let i = 0; i < years.length; i++) {
        const yearStart = new Date(`${years[i]}T00:00:00Z`)
        const yearEnd = i < years.length - 1 
          ? new Date(`${years[i+1]}T00:00:00Z`) 
          : new Date(new Date().setFullYear(currentYear + 1, 0, 1)) // Next year Jan 1
        
        const count = await photoglowDb.user.count({
          where: {
            createdAt: {
              gte: yearStart,
              lt: yearEnd
            }
          }
        })
        
        userCountsByYear.push({
          date: years[i],
          users: count
        })
      }
      
      formattedData = userCountsByYear
    }
    
    return NextResponse.json({ data: formattedData })
  } catch (error) {
    console.error('Error fetching user growth data:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper functions
function formatDateString(date: Date, granularity: 'day' | 'month' | 'year' = 'day'): string {
  const d = new Date(date)
  if (granularity === 'day') {
    return d.toISOString().split('T')[0] // YYYY-MM-DD
  } else if (granularity === 'month') {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01` // YYYY-MM-01
  } else {
    return `${d.getFullYear()}-01-01` // YYYY-01-01
  }
}

function generateDateRange(start: Date, end: Date, granularity: 'day' | 'month' | 'year'): string[] {
  const result = []
  const current = new Date(start)
  
  while (current <= end) {
    result.push(formatDateString(current, granularity))
    
    if (granularity === 'day') {
      current.setDate(current.getDate() + 1)
    } else if (granularity === 'month') {
      current.setMonth(current.getMonth() + 1)
    } else {
      current.setFullYear(current.getFullYear() + 1)
    }
  }
  
  return result
} 
