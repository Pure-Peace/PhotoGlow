import { formatTime } from '@/lib/date'

export const TimeFormatter = ({ dateString }: { dateString: string }) => {
  return <span suppressHydrationWarning>{formatTime(dateString)}</span>
}
