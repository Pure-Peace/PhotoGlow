'use client'

import { useState } from 'react'

import { Button } from '../ui/button'
import { Dialog, DialogDescription, DialogFooter } from '../ui/dialog'
import { DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { useUploadDialogStore } from '@/stores/upload-dialog'
import { useUploadStore } from '@/stores/upload'
import { UploadMain } from './upload-main'
import { toast } from 'sonner'

export function UploadDialog() {
  const { isUploadDialogOpen, setUploadDialog, setUploadCompleted } =
    useUploadDialogStore()
  const [alertDialog, setAlertDialog] = useState(false)

  const { isLoading, reset, formData } = useUploadStore()

  const onOpenChange = (open: boolean) => {
    if (isLoading) {
      toast.error('Please wait for the post to be submitted')
      return
    }

    if (
      !open &&
      (formData.content || formData.title || formData.media.length > 0)
    ) {
      setAlertDialog(true)
    } else {
      setUploadDialog(open)
    }
  }

  return (
    <Dialog open={isUploadDialogOpen} onOpenChange={onOpenChange}>
      <DialogContent className="px-8 md:min-w-2xl">
        {/* upload main */}
        <UploadMain
          onSuccess={() => {
            setUploadDialog(false)
            setUploadCompleted(true)
          }}
        />

        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>Create a post</DialogTitle>
            <DialogDescription>You can upload photos</DialogDescription>
          </DialogHeader>
        </VisuallyHidden>
      </DialogContent>

      {/* alert exit dialog */}
      <Dialog open={alertDialog} onOpenChange={setAlertDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to close?</DialogTitle>
            <DialogDescription>
              You will lose all unsaved changes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={isLoading}
              onClick={() => setAlertDialog(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={isLoading}
              onClick={() => {
                reset()
                setAlertDialog(false)
                setUploadDialog(false)
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
