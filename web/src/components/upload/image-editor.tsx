import { useState } from 'react'
import { useRef } from 'react'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog'
import { Label } from '../ui/label'
import { Slider } from '../ui/slider'
import ReactAvatarEditor from 'react-avatar-editor'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

export type AspectRatio = {
  label: string
  value: string
  width: number
  height: number
}

export const aspectRatios: AspectRatio[] = [
  { label: '1:1 Square', value: '1:1', width: 280, height: 280 },
  { label: '4:3 Standard', value: '4:3', width: 280, height: 210 },
  { label: '16:9 Widescreen', value: '16:9', width: 280, height: 158 },
  { label: '3:4 Portrait', value: '3:4', width: 210, height: 280 },
  { label: '9:16 Story', value: '9:16', width: 158, height: 280 },
]

export type ImageEditorDialogProps = {
  image: string | File
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSaveChanges: (image: HTMLCanvasElement, aspectRatio: string) => void
  initialAspectRatio?: string
  disabled?: boolean
}

export function ImageEditorDialog({
  image,
  isOpen,
  onOpenChange,
  onSaveChanges,
  initialAspectRatio,
  disabled,
}: ImageEditorDialogProps) {
  const editorRef = useRef<ReactAvatarEditor>(null)
  const [imageScale, setImageScale] = useState(1.2)
  const [selectedRatio, setSelectedRatio] = useState<AspectRatio>(
    aspectRatios.find((ratio) => ratio.value === initialAspectRatio) ||
      aspectRatios[0]
  )

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[500px] md:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Image</DialogTitle>
          <DialogDescription>
            Make changes to your image here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-2 py-2 sm:gap-4 sm:py-4">
          <div className="w-full px-1 sm:px-2">
            <Label>Aspect Ratio</Label>
            <Select
              value={selectedRatio.value}
              onValueChange={(value) => {
                const ratio = aspectRatios.find((r) => r.value === value)
                if (ratio) setSelectedRatio(ratio)
              }}
              disabled={disabled}
            >
              <SelectTrigger className="my-2 sm:my-4 w-full">
                <SelectValue placeholder="Select aspect ratio" />
              </SelectTrigger>
              <SelectContent>
                {aspectRatios.map((ratio) => (
                  <SelectItem key={ratio.value} value={ratio.value}>
                    {ratio.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="max-w-full overflow-hidden">
            <ReactAvatarEditor
              ref={editorRef}
              image={image}
              width={selectedRatio.width}
              height={selectedRatio.height}
              border={16}
              borderRadius={8}
              scale={imageScale}
              className="border-muted rounded-lg border-2 max-w-full"
            />
          </div>

          <div className="w-full px-1 sm:px-2">
            <Label>Zoom</Label>
            <Slider
              className="py-2"
              value={[imageScale]}
              min={1}
              max={3}
              step={0.01}
              onValueChange={(value) => setImageScale(value[0])}
              disabled={disabled}
            />
          </div>

          <Button
            onClick={() => {
              if (!editorRef.current) return
              onSaveChanges(editorRef.current.getImage(), selectedRatio.value)
            }}
            disabled={disabled}
            className="mt-2"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
