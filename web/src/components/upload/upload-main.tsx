'use client'

import { AuthButton } from '../auth/auth-button'
import { Upload, Lock } from 'lucide-react'
import { useCallback, useState, useEffect } from 'react'
import { MAX_IMAGE_SIZE, MAX_IMAGES, UploadMedia } from './upload-media'
import {
  ContentForm,
  MAX_CONTENT_LENGTH,
  MAX_TITLE_LENGTH,
  formSchema,
} from './content-editor'
import { UploadSettings } from './upload-settings'
import { UploadActions } from './upload-actions'
import { cn } from '@/lib/utils'
import { useLoggedIn } from '@/hooks/auth'
import { useUploadStore } from '@/stores/upload'
import { toast } from 'sonner'
import { api } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { useRouter } from 'next/navigation'
export type UploadMainProps = {
  onSuccess?: () => void
  className?: string
  isEditPostMode?: boolean
  postId?: string
}

// Main upload component
export function UploadMain({
  onSuccess,
  className,
  isEditPostMode,
  postId,
}: UploadMainProps) {
  const isLoggedIn = useLoggedIn()
  const {
    formData,
    isLoading,
    setIsLoading,
    setUploadProgress,
    clearUploadProgress,
    setMediaError,
    reset,
    loadMediaDrafts,
    setMediaFromDrafts,
    mediaDraftMap,
  } = useUploadStore()

  const { accessToken, user } = useAuthStore()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [hasFetchedDrafts, setHasFetchedDrafts] = useState(false)

  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      title: formData.title,
      content: formData.content,
    },
  })

  // Fetch and restore media drafts on component mount
  useEffect(() => {
    const restoreMediaDrafts = async () => {
      if (
        !accessToken ||
        !isLoggedIn ||
        hasFetchedDrafts ||
        formData.media.length > 0 ||
        isEditPostMode // Skip draft restoration when editing
      ) {
        return
      }

      try {
        const mediaDrafts = await loadMediaDrafts(accessToken)
        if (mediaDrafts.length > 0) {
          toast.info(
            `Restoring ${mediaDrafts.length} pending media ${mediaDrafts.length === 1 ? 'file' : 'files'} from your previous session`
          )
          setMediaFromDrafts(mediaDrafts)
        }
      } catch (error) {
        console.error('Failed to restore media drafts:', error)
      } finally {
        setHasFetchedDrafts(true)
      }
    }

    restoreMediaDrafts()
  }, [
    accessToken,
    isLoggedIn,
    hasFetchedDrafts,
    formData.media.length,
    loadMediaDrafts,
    setMediaFromDrafts,
    isEditPostMode,
  ])

  const validation = useCallback(() => {
    let err = false

    // Reset media error first
    setMediaError(null)

    // title validation
    if (!formData.title || formData.title.length > MAX_TITLE_LENGTH) {
      form.setError('title', {
        type: 'manual',
        message: `Title is required and must be less than ${MAX_TITLE_LENGTH} characters`,
      })
      err = true
    }

    // content validation
    if (formData.content.length > MAX_CONTENT_LENGTH) {
      form.setError('content', {
        type: 'manual',
        message: `Content must be less than ${MAX_CONTENT_LENGTH} characters`,
      })
      err = true
    }

    // media validation
    if (formData.media.length === 0) {
      setMediaError(`At least one image is required`)
      err = true
    } else if (formData.media.length > MAX_IMAGES) {
      setMediaError(`Maximum ${MAX_IMAGES} images are allowed`)
      err = true
    }

    for (const file of formData.media) {
      if (file instanceof File) {
        // size validation
        if (file.size > MAX_IMAGE_SIZE) {
          setMediaError(
            `Media is too large and must be less than ${MAX_IMAGE_SIZE} bytes`
          )
          err = true
        }

        // type validation
        if (
          !['image/jpeg', 'image/png', 'image/webp', 'image/bmp'].includes(
            file.type
          )
        ) {
          setMediaError(
            `Media is not an image and must be one of the following types: ${['image/jpeg', 'image/png', 'image/webp', 'image/bmp'].join(', ')}`
          )
          err = true
        }
      }
    }

    return !err
  }, [formData.content, formData.media, formData.title, form, setMediaError])

  const handlePublish = useCallback(async () => {
    let toastId: string | number | undefined = undefined

    // set loading state
    setIsLoading(true)

    // reset submit error
    setSubmitError(null)

    try {
      if (!accessToken) {
        throw new Error('Please login to submit your post')
      }

      // validation
      if (!validation()) return

      // Show appropriate message based on mode
      toastId = toast.info(
        isEditPostMode
          ? "Updating your post, please don't close the dialog"
          : "Your post is being submitted, please don't close the dialog"
      )

      // 1. Prepare media for submission
      const { isMediaDraft } = useUploadStore.getState()

      // Array to hold all media entries for final submission
      const mediaUploads: Array<{
        url: string
        type: 'image' | 'video'
        alt?: string
        order: number
        draftId?: string // Add draftId field for draft media
      }> = []

      // Process each media item - either upload a file or use existing draft
      await Promise.all(
        formData.media.map(async (media, index) => {
          try {
            // Check if this is a draft media
            if (isMediaDraft(media)) {
              // For drafts, just use the existing information
              setUploadProgress(index, 100)
              mediaUploads.push({
                url: media.url,
                type: media.mediaType,
                alt: '',
                order: index,
                draftId: media.draftId, // Include the draft ID
              })
              return
            }

            // Otherwise, this is a regular File that needs to be uploaded
            const file = media as File

            // Check if this file has a draft mapping
            const draftId = mediaDraftMap[file.name]

            if (draftId) {
              // If we have a draft ID in our map, look for it in existing drafts
              const existingDrafts = await api.getUserMediaDrafts(accessToken)
              const draftMatch = existingDrafts.find(
                (draft) => draft.draftId === draftId
              )

              if (draftMatch) {
                // We found a matching draft, use it without re-uploading
                console.debug(
                  'Using existing draft for file via mapping:',
                  file.name,
                  draftMatch
                )
                setUploadProgress(index, 100)
                mediaUploads.push({
                  url: draftMatch.url,
                  type: draftMatch.mediaType,
                  alt: '',
                  order: index,
                  draftId: draftMatch.draftId,
                })
                return
              }
            }

            // If no matching draft, upload normally
            console.debug(
              'No matching draft found for file, uploading:',
              file.name
            )
            const result = await api.uploadMedia(
              accessToken,
              file,
              (progress) => {
                console.debug(
                  `Uploaded ${progress.bytesUploaded} of ${progress.totalBytes} bytes`
                )
                console.debug(`Progress: ${progress.progress}%`)
                setUploadProgress(index, progress.progress)
              }
            )

            mediaUploads.push({
              url: result.url,
              type: result.mediaType,
              alt: '',
              order: index,
              draftId: result.draftId,
            })
          } catch (error) {
            console.error(`Failed to process media at index ${index}:`, error)
            // Continue with other media even if one fails
          }
        })
      )

      // Check if we have any successful uploads
      if (mediaUploads.length === 0) {
        throw new Error('All media processing failed')
      }

      // Sort by order to ensure correct sequence
      mediaUploads.sort((a, b) => a.order - b.order)

      if (isEditPostMode && postId) {
        // 2. Edit existing post
        const success = await api.editPost(accessToken, postId, {
          title: formData.title,
          content: formData.content,
          visibility: formData.visibility,
          media: mediaUploads,
          type: formData.type || 'PHOTO',
          topicIds: formData.topicIds,
          tagIds: formData.tagIds,
        })

        if (!success) {
          throw new Error('Failed to update post')
        }

        toast.success('Post updated successfully!', {
          id: toastId,
          richColors: true,
        })

        postId = postId
      } else {
        // 2. Submit new post
        postId = await api.submitPost(accessToken, {
          title: formData.title,
          content: formData.content,
          visibility: formData.visibility,
          media: mediaUploads,
          type: formData.type || 'PHOTO',
          topicIds: formData.topicIds,
          tagIds: formData.tagIds,
        })

        toastId = toast.success('Post submitted successfully!', {
          id: toastId,
          richColors: true,
        })
      }

      // redirect to post
      router.push(`/@${user?.username}/photo/${postId}`)

      // reset form and store
      form.reset()
      reset()

      onSuccess?.()
    } catch (error) {
      // clear upload progress
      clearUploadProgress()

      // set submit error
      console.error(
        isEditPostMode ? 'Failed to update post' : 'Failed to submit post',
        error
      )
      setSubmitError(error instanceof Error ? error.message : String(error))

      // show error toast
      toast.error(
        (isEditPostMode
          ? 'Failed to update post: '
          : 'Failed to submit post: ') + error,
        {
          id: toastId,
          richColors: true,
        }
      )
    } finally {
      setIsLoading(false)
    }
  }, [
    accessToken,
    formData.content,
    formData.media,
    formData.title,
    formData.type,
    formData.visibility,
    onSuccess,
    router,
    setIsLoading,
    setSubmitError,
    setUploadProgress,
    user?.username,
    validation,
    mediaDraftMap,
    clearUploadProgress,
    form,
    reset,
    formData.topicIds,
    formData.tagIds,
    isEditPostMode,
    postId,
  ])

  if (!isLoggedIn) {
    return <NotLoggedIn />
  }

  return (
    <div className={cn('flex h-full flex-col max-sm:relative', className)}>
      <div className="py-6 max-sm:py-4">
        <h1 className="text-2xl font-bold max-sm:text-xl">
          {isEditPostMode ? 'Edit post' : 'Create a post'}
        </h1>
        <span className="text-muted-foreground my-6 text-sm max-sm:my-3">
          You can upload up to {MAX_IMAGES} photos, the first photo will be used
          as the cover
        </span>
      </div>

      <div className="flex-1 space-y-10 overflow-y-auto pb-8 max-sm:space-y-6 max-sm:pb-4">
        {/* Media Upload Section */}
        <UploadMedia isEditPostMode={isEditPostMode} />

        {/* Content Form Section */}
        <ContentForm form={form} />

        {/* Settings Section */}
        <UploadSettings />

        {/* Submit Error Message */}
        {submitError && (
          <p className="text-destructive text-sm">Error: {submitError}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="max-sm:bg-background max-sm:sticky max-sm:right-0 max-sm:bottom-0 max-sm:left-0 max-sm:px-4 max-sm:py-3">
        <UploadActions
          onPublish={handlePublish}
          disabled={isLoading}
          isEditPostMode={isEditPostMode}
        />
      </div>
    </div>
  )
}

// Not logged in component
export function NotLoggedIn() {
  return (
    <div className="flex h-[70vh] flex-col items-center justify-center space-y-6 text-center">
      <div className="flex justify-center">
        <div className="relative">
          <Upload
            className="text-muted-foreground/40 size-20"
            strokeWidth={1.2}
          />
          <span className="bg-background text-foreground absolute -right-1 -bottom-1 size-7 rounded-full p-1">
            <Lock className="size-full" />
          </span>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-foreground/90 text-xl font-semibold">
          Authentication Required
        </h3>
        <p className="text-muted-foreground mt-2 text-sm">
          <span>Please</span>
          <AuthButton
            variant="link"
            className="text-primary mx-1.5 font-medium underline-offset-4 hover:underline"
          >
            Log in
          </AuthButton>
          <span>to start uploading your photos</span>
        </p>
      </div>
    </div>
  )
}
