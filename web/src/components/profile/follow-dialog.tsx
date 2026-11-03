import { DialogDescription, DialogTitle } from '@radix-ui/react-dialog'
import { Dialog, DialogContent } from '../ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs'
import { useState } from 'react'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { UserList } from './user-list'

type FollowDialogProps = {
  open: boolean
  setOpen: (open: boolean) => void
  initialTab?: 'followers' | 'following'
  followers: number
  following: number
  username: string
}

export function FollowDialog({
  open,
  setOpen,
  initialTab = 'followers',
  followers,
  following,
  username,
}: FollowDialogProps) {
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(
    initialTab
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="lg:min-w-[600px]">
        <Tabs
          defaultValue={activeTab}
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as 'followers' | 'following')
          }
          className="mt-6 w-full"
        >
          <TabsList className="w-full">
            <TabsTrigger value="followers" className="flex-1">
              Followers ({followers})
            </TabsTrigger>
            <TabsTrigger value="following" className="flex-1">
              Following ({following})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="followers">
            <div className="py-4">
              <UserList username={username} type="followers" />
            </div>
          </TabsContent>
          <TabsContent value="following">
            <div className="py-4">
              <UserList username={username} type="following" />
            </div>
          </TabsContent>
        </Tabs>

        <VisuallyHidden>
          <DialogTitle>{activeTab}</DialogTitle>
          <DialogDescription>the {activeTab} of the user</DialogDescription>
        </VisuallyHidden>
      </DialogContent>
    </Dialog>
  )
}
