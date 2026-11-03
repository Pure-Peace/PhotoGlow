import { create } from 'zustand'

export type AuthFormVariant = 'login' | 'signup' | 'reset-password'

export interface AuthFormData {
  email: string
  password: string
  username?: string
  verification?: string
}

export interface AuthFormStore {
  formData: AuthFormData
  updateFormData: (data: Partial<AuthFormData>) => void
  resetFormData: () => void
}

export const useAuthFormStore = create<AuthFormStore>((set) => ({
  formData: {
    email: '',
    password: '',
    username: '',
    verification: '',
  },

  updateFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),

  resetFormData: () =>
    set({
      formData: {
        email: '',
        password: '',
        username: '',
        verification: '',
      },
    }),
}))
