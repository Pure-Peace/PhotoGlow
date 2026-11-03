import { Suspense } from 'react'
import { AppSidebar } from '@/components/site/site-sidebar'
import { SiteHeader } from '@/components/site/site-header'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { UsersDataTable } from '@/components/users/users-data-table'
import { UsersTableSkeleton } from '@/components/users/users-table-skeleton'

export default function UsersPage() {
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
        <SiteHeader title="User Management" />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">Users</h1>
            </div>
            <Suspense fallback={<UsersTableSkeleton />}>
              <UsersDataTable />
            </Suspense>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 
