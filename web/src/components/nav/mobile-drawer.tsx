'use client'

import { useAuthStore } from '@/stores/auth'
import { Menu, LogOut, PlusSquare, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

import { useLogoutDialogStore } from '@/stores/logout-dialog'
import { ThemeButton } from '@/components/theme/theme-button'
import { Button } from '@/components/ui/button'
import {
  DrawerTrigger,
  DrawerContent,
  DrawerClose,
  Drawer,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer'
import { NavAvatar } from '@/components/nav/nav-avatar'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { useAuthGuard } from '@/components/common/require-auth'
import { useUploadDialogStore } from '@/stores/upload-dialog'
import { useMediaQuery } from 'react-responsive'
import { UnreadBadge } from '../notifications/unread-badge'
import { NAV_ITEM_LIST, DROPDOWN_MOBILE_ONLY } from './nav-list'
import { useNotificationsStore } from '@/stores/notifications'
export function HeaderDrawerMenu() {
  const { user, isLoggedIn } = useAuthStore()
  const logoutDialog = useLogoutDialogStore((state) => state.authDialog)
  const setUploadDialog = useUploadDialogStore((state) => state.setUploadDialog)
  const pathname = usePathname()

  // drawer state
  const [open, setOpen] = useState(false)

  const isMobile = useMediaQuery({ query: '(max-width: 768px)' })

  const { unreadCount, unreadChatCount } = useNotificationsStore()

  const closeDrawer = () => {
    setOpen(false)
  }

  const RequireAuth = useAuthGuard(closeDrawer)

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="right">
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </DrawerTrigger>

      <DrawerContent className="bg-background flex h-full max-w-3xs flex-col">
        {/* Header Section */}
        <div className="flex items-center justify-between border-b p-4">
          <RequireAuth>
            <Link
              href={`/@${user?.username}`}
              onClick={() => {
                setOpen(false)
              }}
              className="flex items-center gap-3"
            >
              <NavAvatar
                username={user?.username ?? null}
                avatar={user?.avatar ?? null}
              />
              <div className="flex flex-col items-start">
                <span className="font-medium">{user?.username}</span>
                <span className="text-muted-foreground text-sm">
                  View profile
                </span>
              </div>
            </Link>
          </RequireAuth>

          <DrawerClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 rounded-full"
            >
              <ArrowRight className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </DrawerClose>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-1 overflow-y-auto p-2">
          {/* Navigation Items */}
          {[...NAV_ITEM_LIST, ...DROPDOWN_MOBILE_ONLY].map(
            ({ icon, href, label, auth }) => {
              if (auth && !isLoggedIn) return null

              return (
                <Button
                  key={href}
                  variant="ghost"
                  className={`w-full justify-start rounded-lg ${
                    (
                      href === '/'
                        ? pathname === href
                        : pathname.startsWith(href)
                    )
                      ? 'bg-accent'
                      : ''
                  }`}
                  asChild
                >
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3"
                  >
                    {icon}

                    <div className="flex items-center gap-1">
                      <span>{label}</span>
                      {href === '/notifications' ? (
                        <UnreadBadge count={unreadCount} />
                      ) : href === '/chat' ? (
                        <UnreadBadge count={unreadChatCount} />
                      ) : null}
                    </div>
                  </Link>
                </Button>
              )
            }
          )}

          <RequireAuth>
            <Button
              variant="ghost"
              className="w-full justify-start rounded-lg"
              asChild
            >
              <Link
                href="/upload"
                onClick={(e) => {
                  setOpen(false)
                  if (!isMobile) {
                    e.preventDefault()
                    setUploadDialog(true)
                  }
                }}
                className="flex items-center gap-3"
              >
                <PlusSquare className="h-5 w-5" />
                <span>Upload</span>
              </Link>
            </Button>
          </RequireAuth>

          <ThemeButton
            variant="ghost"
            className="flex w-full items-center justify-start gap-3 p-0"
          >
            Theme
          </ThemeButton>
        </div>

        {/* Footer Section */}
        <div className="border-t p-2">
          {isLoggedIn && (
            <Button
              variant="ghost"
              className="text-destructive hover:bg-destructive/10 w-full justify-start rounded-lg"
              onClick={() => {
                closeDrawer()
                logoutDialog()
              }}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Log out
            </Button>
          )}
        </div>
      </DrawerContent>

      <VisuallyHidden>
        <DrawerTitle>Navigation Menu</DrawerTitle>
        <DrawerDescription>Mobile navigation menu</DrawerDescription>
      </VisuallyHidden>
    </Drawer>
  )
}
