'use client'

import React, { useCallback, useState } from 'react'
import ReactAvatarEditor from 'react-avatar-editor'

import { AvatarChangeable } from '../ui/user-avatar'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import { RefreshCcw, Trash2 } from 'lucide-react'
import { Slider } from '../ui/slider'
import { Label } from '../ui/label'

export type BaseAvatarEditorProps = {
  image: string | File
  onRemove?: () => void
  disabled?: boolean
  ref?: React.Ref<ReactAvatarEditor>
}

export type AvatarEditorProps = BaseAvatarEditorProps & {
  name?: string
  avatar?: string
  className?: string
}

export type AvatarEditorRef = ReactAvatarEditor

export function BaseAvatarEditor({
  image,
  onRemove,
  ref,
  disabled,
}: BaseAvatarEditorProps) {
  const defaultScale = 1.2
  const defaultPosition = { x: 0.5, y: 0.5 }

  const [scale, setScale] = useState(defaultScale)
  const [position, setPosition] = useState(defaultPosition)

  return (
    <>
      {/* Editor */}
      <ReactAvatarEditor
        ref={ref}
        className={cn(
          'border-muted rounded-lg border-2',
          disabled && 'opacity-70'
        )}
        image={image}
        width={250}
        height={250}
        borderRadius={250}
        border={15}
        scale={scale}
        rotate={0}
        position={position}
        onPositionChange={setPosition}
      />

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4">
        {/* Remove */}
        <Button
          type="button"
          variant="outline"
          onClick={onRemove}
          disabled={disabled}
        >
          <Trash2 className="size-4" />
        </Button>

        {/* Reset */}
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={() => {
            setScale(defaultScale)
            setPosition(defaultPosition)
          }}
        >
          <RefreshCcw className="size-4" />
        </Button>

        {/* Resize */}
        <div className="min-w-42 px-2">
          <Label>Resize</Label>
          <Slider
            className="py-2"
            value={[scale]}
            min={1}
            max={5}
            step={0.01}
            onValueChange={(value) => setScale(value[0])}
            disabled={disabled}
          />
        </div>
      </div>
    </>
  )
}

export function AvatarEditor({
  name,
  avatar,
  className,
  ref,
  disabled,
}: AvatarEditorProps) {
  const [image, setImage] = useState<File | string | null>(null)

  const onAvatarSelected = useCallback((files: File[]) => {
    setImage(files[0])
  }, [])

  const Comp = image ? (
    <BaseAvatarEditor
      ref={ref}
      image={image}
      onRemove={() => setImage(null)}
      disabled={disabled}
    />
  ) : (
    <AvatarChangeable
      name={name}
      avatar={avatar}
      className={className}
      onAvatarSelected={onAvatarSelected}
      disabled={disabled}
    />
  )

  return (
    <div
      className={cn(
        'relative flex items-center justify-center py-4',
        image && 'flex-col gap-2',
        disabled && 'pointer-events-none opacity-70'
      )}
    >
      {Comp}
    </div>
  )
}
