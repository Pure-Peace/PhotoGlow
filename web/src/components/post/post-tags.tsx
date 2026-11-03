export function PostTag({ tag }: { tag: string }) {
  return (
    <span
      key={tag}
      className="bg-muted hover:bg-muted/80 text-muted-foreground cursor-pointer rounded-full px-3 py-1 text-xs transition-colors"
    >
      #{tag}
    </span>
  )
}

export function PostTags({ tags }: { tags: string[] }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <PostTag key={tag} tag={tag} />
      ))}
    </div>
  )
}
