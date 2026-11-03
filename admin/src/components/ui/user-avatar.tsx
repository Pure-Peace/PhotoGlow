'use client'

import { Camera } from 'lucide-react'
import { Edit } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from './avatar'
import { useDropzone } from 'react-dropzone'
import { cn } from '@/lib/utils'

type UserAvatarProps = {
  name?: string
  avatar?: string
  className?: string
  imageClassName?: string
  fallbackClassName?: string
}

type AvatarChangeableProps = UserAvatarProps & {
  onAvatarSelected?: (files: File[]) => void
  disabled?: boolean
}

export function UserAvatar({
  name,
  avatar,
  className,
  imageClassName,
  fallbackClassName,
  ...props
}: UserAvatarProps) {
  return (
    <Avatar className={className} {...props}>
      <AvatarImage src={avatar} alt={name} className={imageClassName} />
      <AvatarFallback className={fallbackClassName}>
        {name?.slice(0, 2)}
      </AvatarFallback>
    </Avatar>
  )
}

export function AvatarChangeable({
  name,
  avatar,
  className,
  fallbackClassName,
  onAvatarSelected,
  disabled,
  ...props
}: AvatarChangeableProps) {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: onAvatarSelected,
    disabled,
  })

  return (
    <div
      className={cn(
        'group relative cursor-pointer select-none',
        disabled && 'pointer-events-none'
      )}
      {...getRootProps()}
      {...props}
    >
      {/* avatar */}
      <UserAvatar
        name={name}
        avatar={avatar}
        className={className}
        fallbackClassName={fallbackClassName}
      />

      {/* hover icon */}
      <div className="bg-background/80 absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-full opacity-0 transition-opacity group-hover:opacity-100">
        <Camera className="size-8" />
        <span className="text-xs font-medium">Change avatar</span>
      </div>

      {/* side icon */}
      <div className="bg-muted ring-background absolute right-0 bottom-0 rounded-full p-1.5 ring-[3px]">
        <Edit className="text-primary size-4" />
      </div>

      {/* input */}
      <input
        {...getInputProps()}
        accept="image/png, image/webp, image/jpeg, image/bmp"
      />
    </div>
  )
}
