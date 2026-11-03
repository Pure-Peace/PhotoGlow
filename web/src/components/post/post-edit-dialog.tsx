'use client'

import {
  Dialog,
  DialogContent,
  DialogPortal,
  DialogOverlay,
  DialogTitle,
} from '@radix-ui/react-dialog'
import { useEffect } from 'react'
import { UploadMain } from '../upload/upload-main'
import type { Post } from '@photoglow/shared/types/post'
import { useUploadStore } from '@/stores/upload'
import { X } from 'lucide-react'
import { Button } from '../ui/button'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

export interface PostEditDialogProps {
  post: Post
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function PostEditDialog({
  post,
  isOpen,
  onClose,
  onSuccess,
}: PostEditDialogProps) {
  const { setFormData, reset } = useUploadStore()

  // Initialize form data with post content when dialog opens
  useEffect(() => {
    if (isOpen && post) {
      // Convert media objects from post to DraftMedia format
      const draftMedia = post.media.map((item) => ({
        url: item.url,
        draftId: item.id,
        mediaType: item.type,
        isDraft: true as const,
      }))

      // Set form data based on post
      setFormData({
        title: post.title,
        content: post.content || '',
        media: draftMedia,
        visibility: post.visibility,
        type: post.type,
        // Add any additional fields that might be needed
        topicIds: post.topics?.map((topic) => topic.id) || [],
        tagIds: post.tags?.map((tag) => tag.id) || [],
      })
    }

    // Cleanup on dialog close
    return () => {
      if (!isOpen) {
        reset()
      }
    }
  }, [isOpen, post, setFormData, reset])

  const handleSuccess = () => {
    onClose()
    if (onSuccess) {
      onSuccess()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay className="bg-background/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 backdrop-blur-sm" />
        <DialogContent className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 bg-background fixed top-[50%] left-[50%] z-50 grid w-full max-w-3xl translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg duration-200 sm:rounded-lg md:w-full">
          <div className="absolute top-4 right-4 z-55">
            <VisuallyHidden>
              <DialogTitle className="text-xl font-semibold">
                Edit Post
              </DialogTitle>
            </VisuallyHidden>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          <div className="max-h-[80vh] overflow-auto">
            <UploadMain
              onSuccess={handleSuccess}
              isEditPostMode={true}
              postId={post.id}
            />
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  )
}
