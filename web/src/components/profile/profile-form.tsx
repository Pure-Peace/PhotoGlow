'use client'

import { useRef } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  AvatarEditor,
  AvatarEditorRef,
} from '@/components/profile/avatar-editor'
import { useAuthStore } from '@/stores/auth'
import { canvasToBlob } from '@/lib/utils'
import { toast } from 'sonner'
import { api } from '@/api'
import { usernameRegex, displayNameRegex } from '@/lib/regex'
import { cn } from '@/lib/utils'
import { UpdateUserProfileData } from '@photoglow/shared/types/api'

export type ProfileEditFormProps = {
  isLoading: boolean
  setIsLoading: (isLoading: boolean) => void
  children?: React.ReactNode
  className?: string
  onSuccess?: (newUsername?: string) => void
}

export const formSchema = z.object({
  username: z.string().regex(usernameRegex),
  displayName: z.string().regex(displayNameRegex),
  bio: z.string().max(100),
})

export const avatarMaxSize = 5 * 1024 * 1024 // 5MB

export function ProfileEditForm({
  isLoading,
  setIsLoading,
  onSuccess,
  className,
  children,
}: ProfileEditFormProps) {
  const { user, accessToken, setUser } = useAuthStore()
  const editorRef = useRef<AvatarEditorRef>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: user?.username,
      displayName: user?.displayName,
      bio: user?.bio || '',
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      if (!accessToken) {
        throw new Error('Login expired, please refresh the page')
      }

      const data: UpdateUserProfileData = {
        displayName: values.displayName,
        username: values.username,
        bio: values.bio,
      }

      const avatar = await canvasToBlob(
        editorRef.current?.getImageScaledToCanvas(),
        'image/png'
      )

      if (avatar) {
        if (avatar.size > avatarMaxSize) {
          throw new Error('Avatar is too large (max 5MB)')
        }

        data.avatar = avatar
      }

      const updatedUser = await api.updateUserProfile(accessToken, data)
      const usernameChanged = updatedUser.username !== user?.username

      setUser(updatedUser)

      toast.success('Profile updated successfully', { richColors: true })
      onSuccess?.(usernameChanged ? updatedUser.username : undefined)
    } catch (error) {
      toast.error(`Failed to update profile: ${error}`, { richColors: true })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('space-y-6 max-sm:space-y-4', className)}
      >
        {/* Avatar editor */}
        <FormItem className="max-sm:pb-2">
          <FormLabel className="max-sm:text-sm">Avatar</FormLabel>
          <FormControl>
            <AvatarEditor
              ref={editorRef}
              disabled={isLoading}
              image={user?.avatar || ''}
              name={user?.displayName || ''}
              avatar={user?.avatar || ''}
              className="size-48 max-sm:size-36"
            />
          </FormControl>
          <FormMessage className="max-sm:text-xs" />
        </FormItem>

        {/* Display name */}
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="max-sm:text-sm">Display name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Your display name"
                  autoComplete="name"
                  disabled={isLoading}
                  className="max-sm:h-9 max-sm:text-sm"
                  {...field}
                />
              </FormControl>
              <FormDescription className="max-sm:text-xs">
                This is your public display name.
              </FormDescription>
              <FormMessage className="max-sm:text-xs" />
            </FormItem>
          )}
        />

        {/* Username */}
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel required className="max-sm:text-sm">
                Username
              </FormLabel>
              <FormControl>
                <Input
                  icon={'@'}
                  placeholder="Your unique username"
                  autoComplete="username"
                  disabled={isLoading}
                  className="max-sm:h-9 max-sm:text-sm"
                  {...field}
                />
              </FormControl>
              <FormDescription className="max-sm:text-xs">
                Usernames can only contain letters, numbers, underscores, and
                periods. Changing your username will also change your profile
                link.
              </FormDescription>
              <FormMessage className="max-sm:text-xs" />
            </FormItem>
          )}
        />

        {/* Bio */}
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="max-sm:text-sm">Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe yourself"
                  autoComplete="bio"
                  disabled={isLoading}
                  className="max-sm:min-h-[5rem] max-sm:text-sm"
                  {...field}
                />
              </FormControl>
              <FormDescription className="max-sm:text-xs">
                This is your public bio.
              </FormDescription>
              <FormMessage className="max-sm:text-xs" />
            </FormItem>
          )}
        />

        {/* action button */}
        <div className="max-sm:pt-2">{children}</div>
      </form>
    </Form>
  )
}
