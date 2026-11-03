'use client'
import { cloneElement, ReactElement } from 'react'
import { useAuthStore } from '@/stores/auth'
import { useAuthDialogStore } from '@/stores/auth-dialog'

export interface WithClickProps {
  onClick?: (e: React.MouseEvent<HTMLElement>) => void
}

export type RequireAuthProps = {
  children: ReactElement<WithClickProps>
  onNotLoggedIn?: () => void
}

export function useAuthGuard(onNotLoggedIn?: () => void) {
  return function wrappedComponent(props: RequireAuthProps) {
    return <RequireAuth {...props} onNotLoggedIn={onNotLoggedIn} />
  }
}

export function RequireAuth({ children, onNotLoggedIn }: RequireAuthProps) {
  const { authDialog } = useAuthDialogStore()
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)

  const guard = (e: React.MouseEvent<HTMLElement>) => {
    const onClick = children.props.onClick

    if (isLoggedIn) {
      // default behavior
      onClick?.(e)
    } else {
      // prevent default behavior and open login dialog
      e.preventDefault()

      onNotLoggedIn?.()

      // default behavior passed as callback
      authDialog('login', () => onClick?.(e))
    }
  }

  const childWithGuatd = cloneElement(children, {
    onClick: guard,
  })

  return <>{childWithGuatd}</>
}
