import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface SpinnerProps {
  className?: string
  size?: number
}

export function Spinner({ className, size = 24 }: SpinnerProps) {
  return (
    <Loader2
      className={cn('text-muted-foreground animate-spin', className)}
      size={size}
    />
  )
}
