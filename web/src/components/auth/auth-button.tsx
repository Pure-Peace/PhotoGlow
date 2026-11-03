'use client'

import { Button } from '@/components/ui/button'
import {
  useAuthDialogStore,
  type AuthDialogVariant,
} from '@/stores/auth-dialog'
import { useLoggedIn } from '@/hooks/auth'

type AuthButtonProps = React.ComponentProps<typeof Button> & {
  authVariant?: AuthDialogVariant
}

/* display when not logged in */
export function AuthButton({
  authVariant = 'login',
  ...props
}: AuthButtonProps) {
  const authDialog = useAuthDialogStore((state) => state.authDialog)
  const loggedIn = useLoggedIn()

  if (loggedIn) return null

  return <Button {...props} onClick={() => authDialog(authVariant)} />
}
