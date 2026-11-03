import { create } from 'zustand'

export interface NotificationsStore {
  unreadCount: number
  unreadChatCount: number
  setUnreadCount: (unreadCount: number) => void
  setUnreadChatCount: (unreadChatCount: number) => void
  decrementUnreadCount: () => void
  incrementUnreadCount: () => void
  decrementUnreadChatCount: () => void
  incrementUnreadChatCount: () => void
  subUnreadCount: (unreadCount: number) => void
}

export const useNotificationsStore = create<NotificationsStore>((set) => ({
  unreadCount: 0,
  unreadChatCount: 0,
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  setUnreadChatCount: (unreadChatCount) => set({ unreadChatCount }),
  decrementUnreadCount: () =>
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
  incrementUnreadCount: () =>
    set((state) => ({ unreadCount: state.unreadCount + 1 })),
  decrementUnreadChatCount: () =>
    set((state) => ({
      unreadChatCount: Math.max(0, state.unreadChatCount - 1),
    })),
  incrementUnreadChatCount: () =>
    set((state) => ({ unreadChatCount: state.unreadChatCount + 1 })),
  subUnreadCount: (unreadCount) =>
    set((state) => ({
      unreadCount: Math.max(0, state.unreadCount - unreadCount),
    })),
}))
