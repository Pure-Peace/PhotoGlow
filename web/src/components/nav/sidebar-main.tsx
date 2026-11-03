'use client'

import { ChevronLeft, LogInIcon, PlusSquare } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'

import { AuthButton } from '@/components/auth/auth-button'
import { NavItem } from '@/components/nav/nav-item'
import { NavProfile } from '@/components/nav/nav-profile'
import { NavDropdown } from '@/components/nav/sidebar-dropdown'
import { UploadButton } from '../upload/upload-button'
import { useUploadDialogStore } from '@/stores/upload-dialog'
import { useMediaQuery } from 'react-responsive'
import { UnreadBadge } from '../notifications/unread-badge'
import { NAV_ITEM_LIST } from './nav-list'
import { useSidebarStore } from '@/stores/sidebar-store'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import { useNotificationsStore } from '@/stores/notifications'

export function SiteSidebar() {
  const pathname = usePathname()
  const setUploadDialog = useUploadDialogStore((state) => state.setUploadDialog)
  const { isCollapsed, toggleCollapse } = useSidebarStore()

  const { unreadCount: notificationCount, unreadChatCount: chatCount } =
    useNotificationsStore()

  const isMobile = useMediaQuery({ query: '(max-width: 768px)' })

  const router = useRouter()

  return (
    <aside
      className={cn(
        'bg-background fixed top-14 left-0 z-40 hidden h-[calc(100vh-3.5rem)] transition-[width] duration-150 md:block',
        isCollapsed ? 'w-16' : 'w-16 lg:w-60'
      )}
    >
      <div className="flex h-full flex-col">
        <nav className="space-y-1 p-1.5 pt-4">
          {/* common nav items */}
          {NAV_ITEM_LIST.map(({ icon, href, label, ...item }) => (
            <NavItem
              as={Link}
              key={href}
              href={href}
              isActive={() =>
                href === '/' ? pathname === href : pathname.startsWith(href)
              }
              label={isCollapsed ? undefined : label}
              {...item}
            >
              <div className="relative">
                {icon}
                {href === '/notifications' ? (
                  <UnreadBadge
                    count={notificationCount}
                    className="absolute -top-1.5 -right-2"
                  />
                ) : href === '/chat' ? (
                  <UnreadBadge
                    count={chatCount}
                    className="absolute -top-1.5 -right-2"
                  />
                ) : null}
              </div>
            </NavItem>
          ))}

          <NavItem
            label={isCollapsed ? undefined : 'Upload'}
            onClick={() => {
              if (isMobile) {
                router.push('/upload')
              } else {
                setUploadDialog(true)
              }
            }}
          >
            <PlusSquare />
          </NavItem>

          {/* profile nav item */}
          <NavProfile collapsed={isCollapsed} />

          {/* dropdown menu */}
          <NavDropdown collapsed={isCollapsed} />

          {/* upload button */}
          <UploadButton />

          {/* auth button */}
          <AuthButton
            variant="default"
            size="lg"
            className={cn(
              'my-5 h-12 w-fit rounded-full px-4 text-base lg:w-full'
            )}
          >
            <span className="flex items-center justify-center gap-2 font-bold">
              <LogInIcon className="size-5" />
              {!isCollapsed && <span className="hidden lg:inline">Log in</span>}
            </span>
          </AuthButton>
        </nav>

        {/* footer */}
        <div className="border-t-border/30 relative flex-1 border-t">
          {!isCollapsed && (
            <div
              className={cn(
                'text-muted-foreground overflow-hidden p-4 text-xs transition-all duration-150',
                isCollapsed
                  ? 'max-w-0 opacity-0'
                  : 'max-w-60 opacity-0 lg:opacity-100'
              )}
            >
              <div className="whitespace-nowrap">
                © 2025 PhotoGlow
                <br />
                <span className="text-muted-foreground/70 text-[10px]">
                  All rights reserved
                </span>
              </div>
            </div>
          )}

          {/* collapse button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'bg-background/80 hover:bg-background/90 absolute top-20 left-4.5 hidden size-8 rounded-full shadow-md backdrop-blur-sm lg:flex',
              isCollapsed && 'left-4.5'
            )}
            onClick={toggleCollapse}
          >
            <ChevronLeft
              className={cn(
                'size-4 transition-transform duration-150',
                isCollapsed && 'rotate-180'
              )}
            />
          </Button>
        </div>
      </div>
    </aside>
  )
}
