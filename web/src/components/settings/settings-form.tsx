'use client'

import { z } from 'zod'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '../ui/button'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'sonner'
import { api } from '@/api'
import { useRouter } from 'next/navigation'
export const passwordFormSchema = z.object({
  currentPassword: z.string().min(8).max(26),
  newPassword: z.string().min(8).max(26),
})

export const emailFormSchema = z.object({
  currentPassword: z.string().min(8).max(26),
  newEmail: z.string().email(),
  verificationCode: z.string().length(6),
})

export const resetPasswordFormSchema = z.object({
  verificationCode: z.string().length(6),
  password: z.string().min(8).max(26),
})

export const updateEmailSendCodeSchema = z.object({
  currentPassword: z.string().min(8).max(26),
  newEmail: z.string().email(),
})

export const resetPasswordSendCodeSchema = z.object({
  password: z.string().min(8).max(26),
})

export function ChangePasswordForm() {
  const { accessToken } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
    },
  })

  async function onSubmit(values: z.infer<typeof passwordFormSchema>) {
    setIsLoading(true)
    try {
      if (!accessToken) {
        throw new Error('Login expired, please refresh the page')
      }

      await api.updateUserPassword(
        accessToken,
        values.currentPassword,
        values.newPassword
      )
      toast.success('Password updated successfully', { richColors: true })
      form.reset()
    } catch (error) {
      // Set error message to the form
      if (error instanceof Error) {
        if (error.message.toLowerCase().includes('current password')) {
          form.setError('currentPassword', { message: error.message })
        } else {
          form.setError('newPassword', { message: error.message })
        }
      } else {
        form.setError('currentPassword', {
          message: 'An unexpected error occurred',
        })
      }
      toast.error('Failed to update password', { richColors: true })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-6">
        {/* for auto complete */}
        <input
          type="text"
          autoComplete="username"
          defaultValue={''}
          className="hidden"
          aria-hidden="true"
        />
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="password"
                  placeholder="Your current password"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  placeholder="Your new password"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Saving...' : 'Update Password'}
        </Button>
      </form>
    </Form>
  )
}

export function ChangeEmailForm() {
  const { accessToken, user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)

  const [showVerification, setShowVerification] = useState(false)

  const form = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      currentPassword: '',
      newEmail: '',
      verificationCode: '',
    },
  })

  async function onSubmit(values: z.infer<typeof emailFormSchema>) {
    setIsLoading(true)
    try {
      if (!accessToken) {
        throw new Error('Login expired, please refresh the page')
      }

      await api.updateUserEmail(accessToken, values)
      toast.success('Email updated successfully', { richColors: true })
      form.reset()
      setShowVerification(false)
    } catch (error) {
      toast.error(`Failed to update email: ${error}`, { richColors: true })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSendCode() {
    // Validate password and email first
    const { currentPassword, newEmail } = form.getValues()
    const validationResult = updateEmailSendCodeSchema.safeParse({
      currentPassword,
      newEmail,
    })

    await form.trigger(['currentPassword', 'newEmail'])

    if (!validationResult.success) {
      return
    }

    setIsLoading(true)
    try {
      if (!accessToken) {
        throw new Error('Login expired, please refresh the page')
      }

      if (!user?.email) {
        throw new Error('Invalid parameters')
      }

      await api.sendEmailVerificationCode({
        accessToken,
        email: newEmail,
        type: 'change-email',
      })
      toast.success('Verification code sent', { richColors: true })
      setShowVerification(true)
    } catch (error) {
      toast.error(`Failed to send code: ${error}`, { richColors: true })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-6">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="password"
                  placeholder="Enter your password"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="newEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="Enter new email"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!showVerification ? (
          <Button
            type="button"
            disabled={isLoading}
            className="w-full"
            onClick={handleSendCode}
          >
            {isLoading ? 'Sending...' : 'Send Verification Code'}
          </Button>
        ) : (
          <>
            <FormField
              control={form.control}
              name="verificationCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification code</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      autoComplete="off"
                      placeholder="Enter 6-digit code"
                      disabled={isLoading}
                      maxLength={6}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Updating...' : 'Update Email'}
            </Button>
          </>
        )}
      </form>
    </Form>
  )
}

export function ResetPasswordForm() {
  const { accessToken, user, clearAuth } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const [showVerification, setShowVerification] = useState(false)

  const form = useForm<z.infer<typeof resetPasswordFormSchema>>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      verificationCode: '',
      password: '',
    },
  })

  async function onSubmit(values: z.infer<typeof resetPasswordFormSchema>) {
    setIsLoading(true)
    try {
      if (!accessToken || !user?.email) {
        throw new Error('Login expired, please refresh the page')
      }

      await api.resetPassword(
        user.email,
        values.verificationCode,
        values.password
      )
      toast.success('Password reset successfully', { richColors: true })
      form.reset()
      setShowVerification(false)
      clearAuth()
      router.push('/')
      router.refresh()
    } catch (error) {
      toast.error(`Failed to reset password: ${error}`, { richColors: true })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSendCode() {
    // Validate password and email first
    const { password } = form.getValues()
    const validationResult = resetPasswordSendCodeSchema.safeParse({
      password,
    })

    await form.trigger(['password'])

    if (!validationResult.success) {
      return
    }

    setIsLoading(true)
    try {
      if (!accessToken) {
        throw new Error('Login expired, please refresh the page')
      }

      if (!user?.email) {
        throw new Error('Invalid parameters')
      }

      await api.sendEmailVerificationCode({
        accessToken,
        email: user.email,
        type: 'reset-password',
      })
      toast.success('Verification code sent', { richColors: true })
      setShowVerification(true)
    } catch (error) {
      toast.error(`Failed to send code: ${error}`, { richColors: true })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-6">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  placeholder="Enter new password"
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!showVerification ? (
          <Button
            type="button"
            disabled={isLoading}
            className="w-full"
            onClick={handleSendCode}
          >
            {isLoading ? 'Sending...' : 'Send Verification Code'}
          </Button>
        ) : (
          <>
            <FormField
              control={form.control}
              name="verificationCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification code</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      autoComplete="off"
                      placeholder="Enter 6-digit code"
                      disabled={isLoading}
                      maxLength={6}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </>
        )}
      </form>
    </Form>
  )
}
