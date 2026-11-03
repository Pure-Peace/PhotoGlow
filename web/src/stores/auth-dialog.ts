import { create } from 'zustand'

export type AuthDialogVariant = 'login' | 'signup' | 'reset-password'

export type Callback = (() => void) | null

export interface AuthDialogStore {
  variant: AuthDialogVariant
  isOpen: boolean
  isLoading: boolean
  callback?: Callback

  authDialog: (variant: AuthDialogVariant, callback?: Callback) => void
  closeDialog: () => void
  setLoading: (loading: boolean) => void
  setVariant: (variant: AuthDialogVariant) => void
  clearCallback: () => void
}

export const useAuthDialogStore = create<AuthDialogStore>((set) => ({
  variant: 'login',
  isOpen: false,
  isLoading: false,

  authDialog: (variant, callback) => set({ isOpen: true, variant, callback }),
  closeDialog: () => set({ isOpen: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  setVariant: (variant) => set({ variant }),
  clearCallback: () => set({ callback: undefined }),
}))
