'use client'

import { useSidebarStore } from '@/stores/sidebar-store'
import { SiteSidebar } from './nav/sidebar-main'
import { SiteHeader } from './nav/topbar-main'
import { MobileNav } from './nav/mobile-nav'
import { cn } from '@/lib/utils'

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebarStore()

  return (
    <div className="relative flex min-h-screen flex-col supports-[dvh]:min-h-[100dvh]">
      <SiteHeader />
      <div
        className={cn(
          'flex flex-1 transition-[padding] duration-150 md:pl-16 lg:pl-60',
          isCollapsed && 'md:pl-16 lg:pl-16'
        )}
      >
        <SiteSidebar />
        <main className="flex-1 pb-14 md:pb-0">{children}</main>
      </div>
      <MobileNav />
    </div>
  )
}
