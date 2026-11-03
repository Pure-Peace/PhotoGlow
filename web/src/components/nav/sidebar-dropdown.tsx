'use client'

import Link from 'next/link'
import { useState } from 'react'
import { MoreHorizontal } from 'lucide-react'

import { NavItem } from './nav-item'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { useLogoutDialogStore } from '@/stores/logout-dialog'
import { useLoggedIn } from '@/hooks/auth'

interface NavDropdownProps {
  collapsed?: boolean
}

export function NavDropdown({ collapsed }: NavDropdownProps) {
  const logoutDialog = useLogoutDialogStore((state) => state.authDialog)
  const [isOpen, setIsOpen] = useState(false)

  const isLoggedIn = useLoggedIn()

  const handleLogout = () => {
    setIsOpen(false) // Close dropdown before opening dialog
    logoutDialog()
  }

  if (!isLoggedIn) return null

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <NavItem label={collapsed ? undefined : 'More'}>
          <MoreHorizontal />
        </NavItem>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <Link href="/settings">Account Settings</Link>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
