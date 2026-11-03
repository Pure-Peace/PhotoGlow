'use client'

import { cn } from '@/lib/utils'
import { RequireAuth } from '../common/require-auth'

type NavItemProps<T extends React.ElementType> = {
  as?: T
  label?: string
  auth?: boolean
  children?: React.ReactNode
  isActive?: () => boolean
  requireAuth?: boolean
  className?: string
} & Omit<
  React.ComponentPropsWithoutRef<T>,
  'as' | 'label' | 'children' | 'isActive' | 'requireAuth' | 'className'
>

export function NavItem<T extends React.ElementType>({
  as,
  label,
  auth,
  children,
  isActive,
  requireAuth,
  className,
  ...props
}: NavItemProps<T>) {
  const Comp = as || 'div'

  const component = (
    <Comp
      {...props}
      className={cn(
        'hover:bg-muted/50 group flex h-12 w-full cursor-pointer items-center justify-start gap-3 rounded-sm px-4 text-base font-semibold whitespace-nowrap',
        isActive?.() ? 'text-red-700 dark:text-red-600' : 'text-primary',
        className
      )}
    >
      {children && <span>{children}</span>}
      <span className="overflow-hidden opacity-0 max-lg:w-0 lg:w-auto lg:opacity-100 xl:opacity-100">
        {label}
      </span>
    </Comp>
  )

  return requireAuth ? <RequireAuth>{component}</RequireAuth> : component
}
