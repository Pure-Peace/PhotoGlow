interface DividerProps {
  children?: React.ReactNode
}

export function Divider({ children }: DividerProps) {
  return (
    <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
      {children && (
        <span className="bg-background text-muted-foreground relative z-10 px-2">
          {children}
        </span>
      )}
    </div>
  )
}
