'use client'

import { useEffect, useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardAction,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

interface ChartData {
  date: string
  value: number
}

interface GrowthChartProps {
  title: string
  dataKey: 'users' | 'posts' | 'comments'
  color: string
  apiEndpoint: string
}

const getDescriptionText = (period: string, dataType: string) => {
  switch (period) {
    case 'week':
      return `New ${dataType} in the last 7 days`
    case 'month':
      return `New ${dataType} in the last 30 days`
    case 'year':
      return `Monthly new ${dataType} in the last year`
    default:
      return `Yearly new ${dataType}`
  }
}

export function GrowthChart({ title, dataKey, color, apiEndpoint }: GrowthChartProps) {
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month')

  const chartConfig = {
    [dataKey]: {
      label: title,
      color: color,
    },
  } satisfies ChartConfig

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await fetch(
          `${apiEndpoint}?period=${period}`
        )
        if (!response.ok) {
          throw new Error(`Failed to fetch ${dataKey} growth data`)
        }
        const result = await response.json()
        // Transform the data to match the ChartData interface
        const transformedData = result.data.map((item: any) => ({
          date: item.date,
          value: item[dataKey]
        }))
        setData(transformedData)
      } catch (error) {
        console.error('Error fetching chart data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [period, apiEndpoint, dataKey])

  return (
    <Card className="@container/card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              <span className="hidden @[540px]/card:block">
                {getDescriptionText(period, title.toLowerCase())}
              </span>
              <span className="@[540px]/card:hidden">
                {getDescriptionText(period, title.toLowerCase())}
              </span>
            </CardDescription>
          </div>
          <CardAction>
            <Tabs
              defaultValue={period}
              onValueChange={setPeriod}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="year">Year</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardAction>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading ? (
          <div className="flex h-[300px] w-full items-center justify-center">
            <div className="border-primary h-32 w-32 animate-spin rounded-full border-4 border-t-transparent" />
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[300px] w-full"
          >
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`fill${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={color}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={color}
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  if (period === 'week' || period === 'month') {
                    return date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  } else if (period === 'year') {
                    return date.toLocaleDateString('en-US', {
                      month: 'short',
                      year: '2-digit',
                    })
                  } else {
                    return date.toLocaleDateString('en-US', {
                      year: 'numeric',
                    })
                  }
                }}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      const date = new Date(value)
                      if (period === 'week' || period === 'month') {
                        return date.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })
                      } else if (period === 'year') {
                        return date.toLocaleDateString('en-US', {
                          month: 'short',
                          year: '2-digit',
                        })
                      } else {
                        return date.toLocaleDateString('en-US', {
                          year: 'numeric',
                        })
                      }
                    }}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="value"
                type="monotone"
                fill={`url(#fill${dataKey})`}
                stroke={color}
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

// Export individual chart components
export function UserGrowthChart() {
  return (
    <GrowthChart
      title="User Growth"
      dataKey="users"
      color="var(--chart-1)"
      apiEndpoint="/api/dashboard/user-growth"
    />
  )
}

export function PostGrowthChart() {
  return (
    <GrowthChart
      title="Post Growth"
      dataKey="posts"
      color="var(--chart-2)"
      apiEndpoint="/api/dashboard/post-growth"
    />
  )
}

export function CommentGrowthChart() {
  return (
    <GrowthChart
      title="Comment Growth"
      dataKey="comments"
      color="var(--chart-3)"
      apiEndpoint="/api/dashboard/comment-growth"
    />
  )
}
