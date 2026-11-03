'use client'

import { useCallback, useEffect } from 'react'
import { z } from 'zod'
import { useEditor, UseEditorOptions } from '@tiptap/react'
import CharacterCount from '@tiptap/extension-character-count'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import History from '@tiptap/extension-history'
import Placeholder from '@tiptap/extension-placeholder'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { TextEditorMain } from '@/components/text-editor/text-editor-main'
import { AtSign, Hash } from 'lucide-react'
import { MentionButton } from '@/components/text-editor/mention-button'
import { useUploadStore } from '@/stores/upload'
import {
  MentionTopicExtension,
  MentionUserExtension,
} from '@/components/text-editor/extension-mention'
import { cn } from '@/lib/utils'
import { UseFormReturn } from 'react-hook-form'

export const PLACEHOLDER = `What's on your mind?`
export const MAX_CONTENT_LENGTH = 300
export const MAX_TITLE_LENGTH = 20

export const formSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(
      MAX_TITLE_LENGTH,
      `Title cannot exceed ${MAX_TITLE_LENGTH} characters`
    ),
  content: z
    .string()
    .max(
      MAX_CONTENT_LENGTH,
      `Content cannot exceed ${MAX_CONTENT_LENGTH} characters`
    ),
})

export const BASE_EDITOR_CONFIG: UseEditorOptions = {
  extensions: [
    Document,
    Paragraph,
    Text,
    History,
    Placeholder.configure({
      placeholder: PLACEHOLDER,
    }),
    CharacterCount.configure({
      limit: MAX_CONTENT_LENGTH,
    }),
    MentionTopicExtension,
    MentionUserExtension,
  ],
  editorProps: {
    attributes: {
      class: 'focus:outline-none',
    },
  },
  immediatelyRender: false,
}

export type ContentFormProps = {
  form: UseFormReturn<z.infer<typeof formSchema>>
}

export function ContentForm({ form }: ContentFormProps) {
  const { setFormData, isLoading } = useUploadStore()

  const editor = useEditor({
    ...BASE_EDITOR_CONFIG,
    content: form.getValues().content,
    onUpdate: ({ editor }) => {
      const text = editor.getText()
      form.setValue('content', text)
      setFormData({
        content: text,
      })
    },
  })

  // Reset editor when form is reset
  useEffect(() => {
    const subscription = form.watch(() => {
      const values = form.getValues()
      if (!values.title && !values.content && editor) {
        editor.commands.clearContent()
      }
    })
    return () => subscription.unsubscribe()
  }, [form, editor])

  // disable editor when loading
  useEffect(() => {
    if (isLoading) {
      editor?.setEditable(false)
    } else {
      editor?.setEditable(true)
    }
  }, [isLoading])

  // Update store when form values change,
  // only original input field will trigger this
  const onFormChange = useCallback(
    (values: z.infer<typeof formSchema>) => {
      setFormData({
        title: values.title,
      })
    },
    [setFormData]
  )

  return (
    <Form {...form}>
      <form onChange={form.handleSubmit(onFormChange)} className="space-y-4">
        {/* Title input */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <input
                  placeholder="Add a title..."
                  disabled={isLoading}
                  maxLength={MAX_TITLE_LENGTH + 15}
                  className="placeholder:text-primary border-none px-0 text-xl ring-0 outline-0 focus-visible:ring-0"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={() => (
            <FormItem className="block">
              <FormControl>
                <TextEditorMain
                  className={cn(
                    'rounded-lg border-0 px-0',
                    isLoading && 'pointer-events-none'
                  )}
                  displayCounter
                  placeholder={PLACEHOLDER}
                  maxContentLength={MAX_CONTENT_LENGTH}
                  editor={editor!}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <MentionButton editor={editor} disabled={isLoading} input="@">
            <AtSign />
            User
          </MentionButton>
          <MentionButton editor={editor} disabled={isLoading} input="#">
            <Hash />
            Topic
          </MentionButton>
        </div>
      </form>
    </Form>
  )
}
