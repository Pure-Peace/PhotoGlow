'use client'

import { useCallback, useState, useEffect, memo, useMemo, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { Plus, X, Edit } from 'lucide-react'
import { toast } from 'sonner'
import { useDrag, useDrop, DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

import { Button } from '@/components/ui/button'
import { canvasToBlob, cn, createThumbnail } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ImageEditorDialog } from './image-editor'
import { useUploadStore, DraftMedia } from '@/stores/upload'

export const MAX_IMAGES = 9
export const MAX_IMAGE_SIZE = 20 * 1024 * 1024 // 20 MB
export const ACCEPT_IMAGE_TYPES = {
  'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.bmp'],
}

const ItemTypes = {
  IMAGE: 'image',
}

export type AddImageButtonProps = {
  onDrop: (acceptedFiles: File[]) => void
  disabled?: boolean
}

export type ImageItemProps = {
  media: File | DraftMedia
  index: number
  onRemoveImage: () => void
  moveImage: (dragIndex: number, hoverIndex: number) => void
  isEditPostMode?: boolean
}

interface DragItem {
  index: number
}

export function UploadMedia({ isEditPostMode }: { isEditPostMode?: boolean }) {
  const {
    formData,
    editingImage,
    isLoading,
    setEditingImage,
    addMedia,
    removeMedia,
    reorderMedia,
    updateMedia,
    mediaError,
  } = useUploadStore()

  // Store aspect ratios for each image
  const [imageAspectRatios, setImageAspectRatios] = useState<
    Record<number, string>
  >({})

  const moveImage = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      reorderMedia(dragIndex, hoverIndex)
    },
    [reorderMedia]
  )

  // drop: add new images to list
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (isLoading) return

      // Filter out files that are too large
      const validFiles = acceptedFiles.filter(
        (file) => file.size <= MAX_IMAGE_SIZE
      )

      if (validFiles.length !== acceptedFiles.length) {
        toast.error(
          `Some files were rejected because they exceed the 5MB limit, skipped ${acceptedFiles.length - validFiles.length} files`
        )
      }

      addMedia(validFiles)
    },
    [isLoading, addMedia]
  )

  // save edited image
  const handleSaveEditedImage = useCallback(
    async (imageCanvas: HTMLCanvasElement, aspectRatio: string) => {
      if (!editingImage) return

      const editedImageBlob = await canvasToBlob(imageCanvas)
      if (!editedImageBlob) {
        toast.error('Failed to save edited image')
        return
      }

      const newFile = new File([editedImageBlob], editingImage.file.name, {
        type: 'image/png',
        lastModified: Date.now(),
      })

      updateMedia(editingImage.index, newFile)
      setImageAspectRatios((prev) => ({
        ...prev,
        [editingImage.index]: aspectRatio,
      }))
      setEditingImage(null)
    },
    [editingImage, updateMedia, setEditingImage]
  )

  const renderedImages = useMemo(
    () =>
      formData.media.map((media, index) => (
        <DraggableImageItem
          key={`img-${index}`}
          media={media}
          index={index}
          onRemoveImage={() => {
            removeMedia(index)
            setImageAspectRatios((prev) => {
              const newRatios = { ...prev }
              delete newRatios[index]
              return newRatios
            })
          }}
          moveImage={moveImage}
          isEditPostMode={isEditPostMode}
        />
      )),
    [formData.media, removeMedia, moveImage]
  )

  return (
    <div className="space-y-8 max-sm:space-y-4">
      {/* image select area */}
      <ScrollArea className="w-full">
        <DndProvider backend={HTML5Backend}>
          <div className="flex flex-wrap gap-2 py-4 max-sm:py-2">
            {/* Display uploaded images */}
            {renderedImages}

            {/* Add image button - only show if under limit */}
            {formData.media.length < MAX_IMAGES && (
              <AddImageButton
                disabled={isLoading || formData.media.length >= MAX_IMAGES}
                onDrop={onDrop}
              />
            )}
          </div>
        </DndProvider>
      </ScrollArea>

      {/* Error message */}
      {mediaError && (
        <div className="text-destructive mt-2 text-sm">{mediaError}</div>
      )}

      {/* Image Editor Dialog */}
      {editingImage && (
        <ImageEditorDialog
          image={editingImage.file}
          isOpen={!!editingImage}
          onOpenChange={(open) => !open && setEditingImage(null)}
          onSaveChanges={handleSaveEditedImage}
          initialAspectRatio={imageAspectRatios[editingImage.index]}
          disabled={isLoading}
        />
      )}
    </div>
  )
}

export const DraggableImageItem = memo(function DraggableImageItem({
  media,
  index,
  onRemoveImage,
  moveImage,
  isEditPostMode,
}: ImageItemProps) {
  const ref = useRef<HTMLDivElement>(null)

  const [{ isOver }, drop] = useDrop<DragItem, void, { isOver: boolean }>({
    accept: ItemTypes.IMAGE,
    collect(monitor) {
      return {
        isOver: monitor.isOver(),
      }
    },
    hover(item: DragItem) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }

      moveImage(dragIndex, hoverIndex)
      item.index = hoverIndex
    },
  })

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.IMAGE,
    item: () => ({ index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  drag(drop(ref))

  return (
    <div
      ref={ref}
      className={cn(
        'cursor-grab transition-opacity',
        isDragging && 'opacity-50',
        isOver && 'ring-muted-foreground/40 ring-2'
      )}
    >
      <ImageItem
        media={media}
        index={index}
        onRemoveImage={onRemoveImage}
        isEditPostMode={isEditPostMode}
      />
    </div>
  )
})

export const ImageItem = memo(function ImageItem({
  media,
  index,
  onRemoveImage,
  isEditPostMode,
}: Omit<ImageItemProps, 'moveImage'>) {
  const [thumbnail, setThumbnail] = useState<string>('')
  const { setEditingImage, isLoading, uploadProgress, isMediaDraft } =
    useUploadStore()
  const isDraft = isMediaDraft(media)

  const progress = uploadProgress[index] || 0
  const isUploading = isLoading || progress > 0

  useEffect(() => {
    if (!isDraft) {
      // For regular File objects, create thumbnail
      const file = media as File
      createThumbnail(file).then(setThumbnail)
      return () => {
        if (thumbnail) {
          URL.revokeObjectURL(thumbnail)
        }
      }
    }
  }, [media, isDraft])

  // For draft media, directly use the URL without downloading
  const imageUrl = isDraft
    ? (media as DraftMedia).url
    : thumbnail || URL.createObjectURL(media as File)

  return (
    <div
      className={cn(
        'group bg-muted relative aspect-square w-[140px] overflow-hidden rounded-xl shadow-lg max-sm:w-[120px]',
        isUploading && 'pointer-events-none select-none'
      )}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {/* No need to use next/image here */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={`Upload ${index + 1}`}
          className={cn(
            'max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-105',
            isUploading && 'opacity-80'
          )}
        />
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <>
          {/* Dark background */}
          <div className="absolute inset-0 bg-black/40" />
          {/* Progress overlay */}
          <div
            className="absolute right-0 bottom-0 left-0 bg-green-400/40 transition-all duration-300"
            style={{ height: `${progress}%` }}
          >
            <div className="from-primary/40 absolute inset-0 bg-gradient-to-t to-transparent" />
          </div>
          {/* Progress text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-bold text-white drop-shadow-md">
              {Math.round(progress)}%
            </span>
          </div>
        </>
      )}

      {/* Draft Indicator */}
      {isDraft && (
        <div className="absolute top-2 left-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] font-medium text-white">
          Cloud
        </div>
      )}

      {/* Overlay with actions - Only show when not uploading */}
      {!isEditPostMode && !isUploading && (
        <div className="bg-background/0 group-hover:bg-background/30 absolute inset-0 flex items-center justify-center opacity-0 backdrop-blur-[2px] transition-all duration-200 group-hover:opacity-100">
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground/90 hover:text-foreground"
            onClick={() => {
              if (media instanceof File) {
                setEditingImage({ file: media, index })
              }
            }}
            disabled={isLoading}
          >
            <Edit className="size-5" />
          </Button>
        </div>
      )}

      {/* Remove button - Only show when not uploading */}
      {!isUploading && (
        <Button
          variant="ghost"
          size="icon"
          className="text-foreground/90 hover:bg-background/60 hover:text-foreground absolute top-1 right-1 size-6 rounded-full opacity-60 transition-opacity group-hover:opacity-100"
          onClick={() => onRemoveImage()}
          disabled={isLoading}
        >
          <X className="size-3" />
        </Button>
      )}
    </div>
  )
})

export const AddImageButton = memo(function AddImageButton({
  onDrop,
  disabled,
}: AddImageButtonProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT_IMAGE_TYPES,
    maxSize: MAX_IMAGE_SIZE,
    disabled,
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        'hover:border-primary/50 hover:bg-primary/5 group border-muted-foreground/30 relative aspect-square w-[140px] cursor-pointer rounded-xl border-2 border-dashed transition-colors max-sm:w-[120px]',
        isDragActive && 'border-primary/50 bg-primary/5',
        disabled && 'cursor-not-allowed opacity-60'
      )}
    >
      <input {...getInputProps()} />
      <div className="flex size-full flex-col items-center justify-center gap-2">
        <Plus className="text-muted-foreground group-hover:text-primary size-6 transition-colors" />
        <span className="text-muted-foreground text-sm">
          {isDragActive ? 'Drop here' : 'Add photo'}
        </span>
      </div>
    </div>
  )
})
