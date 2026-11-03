import { create } from 'zustand'

export interface UploadDialogStore {
  isUploadDialogOpen: boolean
  uploadCompleted: boolean
  setUploadDialog: (isOpen: boolean) => void
  setUploadCompleted: (completed: boolean) => void
}

export const useUploadDialogStore = create<UploadDialogStore>((set) => ({
  isUploadDialogOpen: false,
  uploadCompleted: false,
  setUploadDialog: (isUploadDialogOpen) => set({ isUploadDialogOpen }),
  setUploadCompleted: (uploadCompleted) => set({ uploadCompleted }),
}))
