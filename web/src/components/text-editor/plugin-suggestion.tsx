import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { cn } from '@/lib/utils'
import { UserAvatar } from '../ui/user-avatar'

export type SuggestionItem = {
  key: string
  label: string
  id: string
  avatar?: string
}

export type SuggestionListProps = {
  items: SuggestionItem[]
  command: (props: { id: string }) => void
  mentionType: string
}

export type SuggestionListRef = {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean
}

export type SuggestionListContentProps = SuggestionListFunctions & {
  items: SuggestionItem[]
  mentionType: string
}

export type SuggestionItemProps = SuggestionListFunctions & {
  item: SuggestionItem
  index: number
  mentionType: string
}

export type SuggestionListFunctions = {
  selectedIndex: number
  setSelectedIndex: (index: number) => void
  selectItem: (index: number) => void
  selectPreviousItem: () => void
  selectNextItem: () => void
}

export function SuggestionListContent({
  items,
  mentionType,
  ...props
}: SuggestionListContentProps) {
  let title = ''
  if (mentionType === 'user') {
    title = 'Mention a user'
  } else if (mentionType === 'topic') {
    title = 'Mention a topic'
  }

  return (
    <div className="border-border bg-background ring-ring/5 relative flex flex-col gap-1 overflow-auto rounded-md border p-1.5 shadow-xl ring-1">
      <div className="text-primary px-3 py-2 text-sm">{title}</div>
      {items.length ? (
        items.map((item, index) => (
          <SuggestionItem
            key={index}
            item={item}
            index={index}
            mentionType={mentionType}
            {...props}
          />
        ))
      ) : (
        <div className="text-muted-foreground px-3 py-2 text-sm">
          No result founded, type to{' '}
          {mentionType === 'user' ? 'continue search user' : 'create a topic'}
        </div>
      )}
    </div>
  )
}

export function SuggestionItem({
  item,
  index,
  mentionType,
  selectedIndex,
  selectItem,
}: SuggestionItemProps) {
  const isSelected = (index: number) => index === selectedIndex

  return (
    <button
      className={cn(
        'flex h-8 w-full items-center gap-2 rounded-sm px-4 py-1.5 text-left text-sm',
        isSelected(index)
          ? 'bg-accent font-bold text-blue-500'
          : 'text-foreground hover:bg-accent/50'
      )}
      onClick={() => selectItem(index)}
    >
      {mentionType === 'user' && (
        <UserAvatar className="size-4" avatar={item.avatar} name={item.label} />
      )}
      {item.label}
    </button>
  )
}

export const SuggestionList = forwardRef<
  SuggestionListRef,
  SuggestionListProps
>(({ items, command, mentionType }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = (index: number) => {
    const item = items[index]
    if (item) {
      command({ id: item.key })
    }
  }

  const selectPreviousItem = () => {
    setSelectedIndex((selectedIndex + items.length - 1) % items.length)
  }

  const selectNextItem = () => {
    setSelectedIndex((selectedIndex + 1) % items.length)
  }

  // default select first item
  useEffect(() => setSelectedIndex(0), [items])

  // expose onKeyDown handler to parent component
  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        selectPreviousItem()
        return true
      }

      if (event.key === 'ArrowDown') {
        selectNextItem()
        return true
      }

      if (event.key === 'Enter') {
        selectItem(selectedIndex)
        return true
      }

      return false
    },
  }))

  return (
    <SuggestionListContent
      items={items}
      selectedIndex={selectedIndex}
      setSelectedIndex={setSelectedIndex}
      selectItem={selectItem}
      selectPreviousItem={selectPreviousItem}
      selectNextItem={selectNextItem}
      mentionType={mentionType}
    />
  )
})

SuggestionList.displayName = 'SuggestionList'
