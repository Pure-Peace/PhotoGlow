'use client'

import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAuthStore } from '@/stores/auth'
import { useState } from 'react'
import { ProfileEditForm } from './profile-form'
import { useRouter } from 'next/navigation'

export type ProfileEditDialogProps = {
  open: boolean
  setOpen: (open: boolean) => void
}

export function ProfileEditDialog({ open, setOpen }: ProfileEditDialogProps) {
  const { isLoggedIn } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  if (open && !isLoggedIn) setOpen(false)

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        // prevent close if loading
        if (isLoading) return
        setOpen(open)
      }}
    >
      <DialogContent>
        <div className="space-y-2 overflow-y-auto px-4 sm:space-y-8">
          {/* header */}
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Edit profile
            </DialogTitle>

            {/* for screen readers */}
            <VisuallyHidden>
              <DialogDescription>
                Make changes to your profile here. Click save when you&apos;re
                done.
              </DialogDescription>
            </VisuallyHidden>
          </DialogHeader>

          {/* Form */}
          <ProfileEditForm
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            className="space-y-8"
            onSuccess={(newUsername) => {
              setOpen(false)
              // if username changed, redirect to the new username
              if (newUsername) {
                router.push(`/@${newUsername}`)
              } else {
                router.refresh()
              }
            }}
          >
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                Save
              </Button>
            </DialogFooter>
          </ProfileEditForm>
        </div>
      </DialogContent>
    </Dialog>
  )
}
