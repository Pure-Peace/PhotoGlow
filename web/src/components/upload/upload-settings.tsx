'use client'

import { Eye, Images, Video, FileText } from 'lucide-react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '../ui/label'
import { useUploadStore } from '@/stores/upload'

export function UploadSettings() {
  const { formData, setFormData, isLoading } = useUploadStore()

  const handleVisibilityChange = (
    value: 'PUBLIC' | 'PRIVATE' | 'FOLLOWERS'
  ) => {
    setFormData({ visibility: value })
  }

  /*  const handleTypeChange = (value: 'PHOTO' | 'VIDEO' | 'ARTICLE') => {
    setFormData({ type: value })
  } */

  return (
    <div className="space-y-4 max-sm:space-y-2">
      {/* Content Type Section !! UNUSED */}
      {/* <Label className="max-sm:text-sm">Content Type</Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Images className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2 max-sm:size-3.5" />
          <Select
            value={formData.type || 'PHOTO'}
            onValueChange={handleTypeChange}
            disabled={isLoading}
          >
            <SelectTrigger className="pl-10 max-sm:h-9 max-sm:text-sm">
              <SelectValue placeholder="Select content type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PHOTO" className="max-sm:text-sm">
                Photo
              </SelectItem>
              <SelectItem value="VIDEO" className="max-sm:text-sm">
                Video
              </SelectItem>
              <SelectItem value="ARTICLE" className="max-sm:text-sm">
                Article
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div> */}

      {/* Visibility Section */}
      <Label className="max-sm:text-sm">Visibility</Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Eye className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2 max-sm:size-3.5" />
          <Select
            value={formData.visibility}
            onValueChange={handleVisibilityChange}
            disabled={isLoading}
          >
            <SelectTrigger className="pl-10 max-sm:h-9 max-sm:text-sm">
              <SelectValue placeholder="Select visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PUBLIC" className="max-sm:text-sm">
                Public
              </SelectItem>
              <SelectItem value="PRIVATE" className="max-sm:text-sm">
                Private
              </SelectItem>
              <SelectItem value="FOLLOWERS" className="max-sm:text-sm">
                Followers Only
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
