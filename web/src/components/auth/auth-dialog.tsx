'use client'

import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { AuthForm } from './auth-form'
import { useEffect } from 'react'
import { useAuthDialogStore } from '@/stores/auth-dialog'

export function AuthDialog() {
  const {
    isOpen,
    variant,
    isLoading,
    closeDialog,
    setVariant,
    setLoading,
    callback,
    clearCallback,
  } = useAuthDialogStore()

  // remove callback when dialog is closed
  useEffect(() => {
    if (isOpen === false && callback) {
      clearCallback()
    }
  }, [isOpen])

  return (
    <Dialog
      open={isOpen}
      onOpenChange={() => {
        if (!isLoading) closeDialog()
      }}
      modal
    >
      <DialogContent
        className="p-2 pb-0 sm:max-w-[425px] md:p-6"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="overflow-y-auto">
          <AuthForm
            variant={variant}
            isLoading={isLoading}
            setLoading={setLoading}
            setVariant={setVariant}
            onSuccess={() => {
              closeDialog()
              callback?.()
            }}
          />
        </div>
      </DialogContent>

      {/* for screen readers down */}
      <VisuallyHidden asChild>
        <DialogTitle>{variant} to photoglow</DialogTitle>
      </VisuallyHidden>
      <VisuallyHidden asChild>
        <DialogDescription>this is a {variant} dialog</DialogDescription>
      </VisuallyHidden>
    </Dialog>
  )
}
