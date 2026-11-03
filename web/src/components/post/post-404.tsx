'use client'

import { ImageOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface Post404Props {
  error?: string
  canRetry?: boolean
  onRetry?: () => void
}

export function Post404({ error, canRetry, onRetry }: Post404Props) {
  const router = useRouter()

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 px-4">
      <ImageOff className="h-32 w-32" strokeWidth={1.5} />
      <div className="flex flex-col items-center gap-2 text-center">
        <h3 className="text-2xl font-semibold">Photo not found</h3>
        <p className="text-muted-foreground text-sm">
          {error ||
            "The photo you're looking for doesn't exist or has been removed"}
        </p>
      </div>

      <div className="flex gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
        {canRetry && onRetry && <Button onClick={onRetry}>Try Again</Button>}
      </div>
    </div>
  )
}
