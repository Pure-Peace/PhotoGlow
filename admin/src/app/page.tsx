import { AppSidebar } from '@/components/site/site-sidebar'
import { DashboardCards } from '@/components/dashboard/dashboard-cards'
import {
  UserGrowthChart,
  PostGrowthChart,
  CommentGrowthChart,
} from '@/components/dashboard/dashboard-chart'
import { SiteHeader } from '@/components/site/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Suspense } from 'react'

export default function DashboardPage() {
  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Dashboard" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <Suspense fallback={<div>Loading stats...</div>}>
                <DashboardCards />
              </Suspense>
              <div className="flex flex-col gap-4 px-4 lg:px-6">
                <Suspense fallback={<div>Loading user growth chart...</div>}>
                  <UserGrowthChart />
                </Suspense>
                <Suspense fallback={<div>Loading post growth chart...</div>}>
                  <PostGrowthChart />
                </Suspense>
                <Suspense fallback={<div>Loading comment growth chart...</div>}>
                  <CommentGrowthChart />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
