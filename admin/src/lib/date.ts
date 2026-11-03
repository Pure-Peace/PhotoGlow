import { formatDistanceToNow, format } from 'date-fns'

/**
 * Format timestamp for display in UI
 */
export function formatTime(timestamp: string): string {
  const date = new Date(timestamp)

  // Format relative time for recent dates (less than 7 days ago)
  const now = new Date()
  const diffInDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)

  if (diffInDays < 7) {
    return formatDistanceToNow(date, { addSuffix: true })
  }

  // Format absolute date for older messages
  return format(date, 'MMM d, yyyy')
}
