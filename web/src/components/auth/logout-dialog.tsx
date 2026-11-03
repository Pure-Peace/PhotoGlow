'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/api'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useLogoutDialogStore } from '@/stores/logout-dialog'

export function LogoutDialog() {
  const { isOpen, closeDialog, isLoading, setLoading } = useLogoutDialogStore()
  const { clearAuth } = useAuthStore()
  const { push, refresh } = useRouter()

  const handleLogout = async () => {
    setLoading(true)
    try {
      await api.logout()
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      toast.info('Logged out successfully')
      clearAuth()
      setLoading(false)
      closeDialog()
      push('/')
      refresh()
    }
  }

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will log you out of your account and clear your session.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isLoading}
            onClick={() => {
              closeDialog()
              window.location.reload()
            }}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction disabled={isLoading} onClick={handleLogout}>
            {isLoading ? 'Logging out...' : 'Log out'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
