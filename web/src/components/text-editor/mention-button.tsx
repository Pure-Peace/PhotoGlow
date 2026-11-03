import { Editor } from '@tiptap/react'
import { Button } from '../ui/button'

export function MentionButton({
  editor,
  input,
  children,
  disabled,
}: {
  editor: Editor | null
  input: string
  children?: React.ReactNode
  disabled?: boolean
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => {
        editor?.chain().focus().insertContent(input).run()
      }}
      disabled={disabled}
    >
      {children}
    </Button>
  )
}
