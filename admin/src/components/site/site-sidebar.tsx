'use client'

import * as React from 'react'
import { LayoutDashboardIcon, UsersIcon, ImageIcon, ClipboardListIcon } from 'lucide-react'
import Link from 'next/link'
import { NavMain } from '@/components/nav/nav-main'
import { NavSecondary } from '@/components/nav/nav-secondary'
import { NavUser } from '@/components/nav/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'

const data: any = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/',
      icon: LayoutDashboardIcon,
    },
    {
      title: 'Users',
      url: '/users',
      icon: UsersIcon,
    },
    {
      title: 'Posts',
      url: '/posts',
      icon: ImageIcon,
    },
    {
      title: 'Admin Logs',
      url: '/logs',
      icon: ClipboardListIcon,
    },
  ],

  navSecondary: [],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <span className="text-base font-semibold">PhotoGlow Admin</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
