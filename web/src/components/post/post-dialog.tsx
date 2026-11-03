'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

import {
  DialogContent,
  DialogOverlay,
  Dialog,
  DialogDescription,
  DialogPortal,
} from '@radix-ui/react-dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

import { PostMain } from './post-main'
import { usePostDialogStore } from '@/stores/post-dialog'

export type BasePostDialogProps = {
  isOpen: boolean
  closeDialog: () => void
  children: React.ReactNode
}

export function BasePostDialog({
  isOpen,
  closeDialog,
  children,
}: BasePostDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={closeDialog}>
      <DialogPortal data-slot="dialog-portal">
        <DialogOverlay
          data-slot="dialog-overlay"
          className="bg-background/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 backdrop-blur-3xl"
        />
        <DialogContent
          data-slot="dialog-content"
          className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed inset-0 z-50 flex overflow-auto duration-150"
        >
          {children}
        </DialogContent>
      </DialogPortal>

      {/* for screen readers down */}
      <VisuallyHidden asChild>
        <DialogDescription>the photo and content</DialogDescription>
      </VisuallyHidden>
    </Dialog>
  )
}

export function PostDialog() {
  const pathname = usePathname()
  const { isOpen, closeDialog, historys, post } = usePostDialogStore()
  const prevIsOpen = useRef(isOpen)
  const router = useRouter()

  useEffect(() => {
    // skip history back when browser popstate
    const eventHandler = () => {
      // when the dialog is open and user click the browser back button
      // we will close the dialog and skip the history back (beacuse browser already set the history back)
      if (isOpen) {
        closeDialog({ skipHistoryBack: true })
      }

      // browser default will not refresh page beacuse its added by history.pushState
      // so we need to refresh and loadthe page manually
      const pathname = window.location.pathname
      if (pathname in historys) {
        delete historys[pathname]
        router.refresh()
      }
    }

    // listen the browser forward and back event
    window.addEventListener('popstate', eventHandler)
    return () => window.removeEventListener('popstate', eventHandler)
  }, [isOpen])

  useEffect(() => {
    // when user click any Link in the dialog (isOpen === true && prevIsOpen === true), we will close the dialog
    // beacuse Link will change history, so we need to skip the history back
    if (isOpen && prevIsOpen.current) {
      closeDialog({ skipHistoryBack: true })
      prevIsOpen.current = false
    } else {
      prevIsOpen.current = isOpen
    }
  }, [pathname])

  return (
    <BasePostDialog isOpen={isOpen} closeDialog={closeDialog}>
      <PostMain isDialogMode post={post} />
    </BasePostDialog>
  )
}
