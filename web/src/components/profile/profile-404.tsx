import { UserRound } from 'lucide-react'

export function Profile404() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-6 px-4">
      <UserRound className="h-32 w-32" strokeWidth={1.5} />
      <div className="flex flex-col items-center gap-2 text-center">
        <h3 className="text-2xl font-semibold">User not found</h3>
        <p className="text-muted-foreground text-sm">
          The profile you&apos;re looking for doesn&apos;t exist or has been
          removed
        </p>
      </div>
    </div>
  )
}
