'use client'

import { Plus } from 'lucide-react'
import { Button } from '../ui/button'
import { useUploadDialogStore } from '@/stores/upload-dialog'
import { useLoggedIn } from '@/hooks/auth'
import { useMediaQuery } from 'react-responsive'
import { useRouter } from 'next/navigation'
import { useSidebarStore } from '@/stores/sidebar-store'
import { cn } from '@/lib/utils'
export function UploadButton() {
  const setUploadDialog = useUploadDialogStore((state) => state.setUploadDialog)
  const isLoggedIn = useLoggedIn()
  const { isCollapsed } = useSidebarStore()

  const isMobile = useMediaQuery({ query: '(max-width: 768px)' })
  const router = useRouter()

  if (!isLoggedIn) return null

  return (
    <Button
      variant="default"
      size="lg"
      className={cn('my-5 h-12 w-fit rounded-full px-4 text-base lg:w-full')}
      onClick={() => {
        if (isMobile) {
          router.push('/upload')
        } else {
          setUploadDialog(true)
        }
      }}
    >
      <span className="flex items-center justify-center gap-2 font-bold">
        <Plus className="size-5" />
        {!isCollapsed && <span className="hidden lg:inline">Upload</span>}
      </span>
    </Button>
  )
}
