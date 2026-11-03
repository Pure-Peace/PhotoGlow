'use client'

import { EditorContent } from '@tiptap/react'
import { Editor } from '@tiptap/react'

import { CircleProgress } from '../ui/circle-progress'
import { cn } from '@/lib/utils'

export type TextEditorPlaceholderProps = {
  placeholder?: string
}

export type TextEditorContentCounterProps = {
  editor: Editor | null
  maxContentLength: number
}

export type TextEditorMainProps = {
  editor: Editor
  content?: string
  className?: string
  displayCounter?: boolean
  placeholder?: string
  maxContentLength?: number
} & React.ComponentProps<typeof EditorContent>

export function TextEditorMain({
  editor,
  content,
  displayCounter,
  className,
  placeholder,
  maxContentLength,
  ...props
}: TextEditorMainProps) {
  return (
    <div className={className}>
      {editor ? (
        <EditorContent editor={editor} content={content} {...props} />
      ) : (
        <TextEditorPlaceholder placeholder={placeholder} />
      )}

      {displayCounter && maxContentLength && (
        <TextEditorContentCounter
          editor={editor}
          maxContentLength={maxContentLength}
        />
      )}
    </div>
  )
}

/* Placeholder when editor not ready */
export function TextEditorPlaceholder({
  placeholder,
}: TextEditorPlaceholderProps) {
  return (
    <div className="tiptap h-6">
      <p className="is-editor-empty" data-placeholder={placeholder} />
    </div>
  )
}

export function TextEditorContentCounter({
  editor,
  maxContentLength,
}: TextEditorContentCounterProps) {
  const currentContentLength = editor?.storage.characterCount.characters() || 0
  const isMaxContentLength = currentContentLength >= maxContentLength

  const percentage = editor
    ? Math.round((100 / maxContentLength) * currentContentLength)
    : 0

  return (
    <div
      className={cn(
        'mt-4 flex items-center justify-end gap-2 text-xs',
        isMaxContentLength ? 'text-destructive' : 'text-muted-foreground'
      )}
    >
      <CircleProgress
        percentage={percentage}
        className={isMaxContentLength ? 'text-destructive' : 'text-blue-500'}
      />

      <span>
        {currentContentLength} / {maxContentLength}
      </span>
    </div>
  )
}
