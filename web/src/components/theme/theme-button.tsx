'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type ThemeButtonProps = {
  comp?: React.ElementType
  icon?: boolean
  children?: React.ReactNode
  className?: string
  props?: React.ComponentProps<React.ElementType>
}

export function ThemeIcon() {
  return (
    <>
      <Sun className="size-4 dark:hidden" />
      <Moon className="hidden size-4 dark:block" />
    </>
  )
}

export function ThemeButton({
  comp,
  children,
  icon = true,
  className,
  ...props
}: ThemeButtonProps & React.ComponentProps<React.ElementType>) {
  const { theme, setTheme } = useTheme()

  const onClick = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  if (comp) {
    const Comp = comp
    return (
      <Comp onClick={onClick} {...props}>
        {icon && <ThemeIcon />}
        {children}
      </Comp>
    )
  }

  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn('rounded-full', className)}
      {...props}
    >
      {icon && <ThemeIcon />}
      {children}
    </Button>
  )
}
