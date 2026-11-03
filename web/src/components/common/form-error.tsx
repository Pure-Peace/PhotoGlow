export function FormError({
  children,
  ...props
}: {
  children: React.ReactNode
} & React.ComponentProps<'p'>) {
  return (
    <p className="text-destructive text-sm" {...props}>
      {children}
    </p>
  )
}
