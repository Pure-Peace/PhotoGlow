'use client'

import { Button } from '@/components/ui/button'
import { Loader2, Send, Save } from 'lucide-react'

export type UploadActionsProps = {
  onPublish: () => void
  disabled?: boolean
  isEditPostMode?: boolean
}

export function UploadActions({
  onPublish,
  disabled,
  isEditPostMode,
}: UploadActionsProps) {
  return (
    <div className="flex justify-end gap-3 max-sm:gap-2">
      <Button
        type="button"
        onClick={onPublish}
        disabled={disabled}
        className="flex items-center gap-2 max-sm:h-9 max-sm:text-sm"
      >
        {disabled ? (
          <Loader2 className="size-4 animate-spin" />
        ) : isEditPostMode ? (
          <Save className="size-4" />
        ) : (
          <Send className="size-4" />
        )}
        {isEditPostMode ? (
          <>
            <span className="max-sm:hidden">Save Changes</span>
            <span className="sm:hidden">Save</span>
          </>
        ) : (
          <>
            <span className="max-sm:hidden">Publish</span>
            <span className="sm:hidden">Post</span>
          </>
        )}
      </Button>
    </div>
  )
}
