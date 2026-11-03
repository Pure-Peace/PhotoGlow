import { create } from 'zustand'

export interface LogoutDialogStore {
  isOpen: boolean
  isLoading: boolean
  authDialog: () => void
  closeDialog: () => void
  setLoading: (loading: boolean) => void
}

export const useLogoutDialogStore = create<LogoutDialogStore>((set) => ({
  isOpen: false,
  isLoading: false,
  authDialog: () => set({ isOpen: true }),
  closeDialog: () => {
    return set({ isOpen: false })
  },
  setLoading: (loading) => set({ isLoading: loading }),
}))
