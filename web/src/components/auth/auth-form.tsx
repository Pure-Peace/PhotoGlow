'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useForm, Controller, SubmitHandler, Control } from 'react-hook-form'
import { AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

import { cn, googleOauthUrl } from '@/lib/utils'
import { Divider } from '@/components/ui/divider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormError } from '@/components/common/form-error'
import { useAuthStore } from '@/stores/auth'
import { api } from '@/api'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AuthFormData,
  AuthFormVariant,
  useAuthFormStore,
} from '@/stores/login-form'
import { GoogleLogoIcon } from '../ui/google'

export type FormInputs = AuthFormData

export type AuthFormProps = React.ComponentPropsWithoutRef<'div'> & {
  variant: AuthFormVariant
  isLoading: boolean
  setLoading: (loading: boolean) => void
  setVariant: (variant: AuthFormVariant) => void
  onSuccess?: () => void
}

export interface AuthFormFieldsProps {
  variant: AuthFormVariant
  isLoading: boolean
  setLoading: (loading: boolean) => void
  setVariant: (variant: AuthFormVariant) => void
  onSuccess?: () => void
}

export interface AuthHeaderProps {
  variant: AuthFormVariant
}

export interface AuthSwitcherProps {
  variant: AuthFormVariant
  isLoading: boolean
  setVariant: (variant: AuthFormVariant) => void
}

export interface VerificationCodeInputProps {
  onSendCode: () => Promise<void>
  control: Control<FormInputs>
  disabled?: boolean
}

export function AuthForm({
  className,
  variant,
  isLoading,
  setLoading,
  setVariant,
  onSuccess,
  ...props
}: AuthFormProps) {
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <div className="text-card-foreground">
        <AuthHeader variant={variant} />
        <div className="grid gap-2 p-4 pt-0 md:gap-6 md:p-6">
          {variant !== 'reset-password' && (
            <>
              <SocialAuthButtons isLoading={isLoading} />
              <Divider>Or continue with</Divider>
            </>
          )}
          <AuthFormFields
            variant={variant}
            setVariant={setVariant}
            isLoading={isLoading}
            setLoading={setLoading}
            onSuccess={onSuccess}
          />
          <PrivacyNotice />
        </div>
        <AuthSwitcher
          variant={variant}
          setVariant={setVariant}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}

export function AuthFormFields({
  variant,
  isLoading,
  setLoading,
  setVariant,
  onSuccess,
}: AuthFormFieldsProps) {
  const { setAccessToken, setUser } = useAuthStore()
  const [globalErrors, setGlobalErrors] = useState<string | null>(null)

  // Reset global errors when variant changes
  useEffect(() => {
    if (globalErrors) setGlobalErrors(null)
  }, [variant])

  const { formData, updateFormData, resetFormData } = useAuthFormStore()

  const BUTTON_TEXT = {
    login: 'Log in',
    signup: 'Sign up',
    'reset-password': 'Reset password',
  }

  const VARIANT_HANDLERS = {
    login: {
      handler: async (data: AuthFormData) => {
        const { user, accessToken } = await api.login(data.email, data.password)
        toast.success('Login successful', {
          richColors: true,
          description: `${user.username}, welcome back!`,
        })
        setAccessToken(accessToken)
        setUser(user)
        onSuccess?.()
      },
    },
    signup: {
      handler: async (data: AuthFormData) => {
        if (!data.username) throw new Error('Username is required')
        if (!data.verification) throw new Error('Verification code is required')
        const { user, accessToken } = await api.register(
          data.email,
          data.password,
          data.username,
          data.verification
        )
        toast.success('Signup successful', {
          richColors: true,
          description: `${user.username}, welcome to PhotoGlow!`,
        })
        setAccessToken(accessToken)
        setUser(user)
        onSuccess?.()
      },
    },
    'reset-password': {
      handler: async (data: AuthFormData) => {
        if (!data.verification) throw new Error('Verification code is required')
        await api.resetPassword(data.email, data.verification, data.password)
        toast.success('Password reset successful', {
          richColors: true,
          description:
            'Your password has been reset, you can log in with your new password.',
        })
        setVariant('login')
      },
    },
  }

  // Setup react-hook-form
  const {
    control,
    handleSubmit,
    formState: { errors: fieldErrors },
  } = useForm<FormInputs>({
    defaultValues: formData,
    mode: 'onBlur',
  })

  const variantHandler = VARIANT_HANDLERS[variant].handler

  // Handle form submission
  const onFormSubmit: SubmitHandler<FormInputs> = async (data) => {
    updateFormData(data)
    setLoading(true)
    try {
      await variantHandler(data)
      resetFormData()
      setLoading(false)
    } catch (err: unknown) {
      console.error(err)
      if (err instanceof Error) {
        setGlobalErrors(err.message)
      } else {
        setGlobalErrors(String(err))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSendCode = async () => {
    if (variant === 'login') return

    await api.sendEmailVerificationCode({
      email: formData.email,
      type: variant,
    })
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="grid gap-4">
      {/* Global error */}
      {globalErrors && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{`Failed to ${BUTTON_TEXT[variant]}`}</AlertTitle>
          <AlertDescription>{globalErrors}</AlertDescription>
        </Alert>
      )}

      {/* Email field */}
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Controller
          name="email"
          control={control}
          defaultValue={''}
          rules={{
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          }}
          render={({ field }) => (
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              disabled={isLoading}
              autoComplete="email"
              {...field}
              onChange={(e) => {
                field.onChange(e)
                updateFormData({ email: e.target.value })
              }}
            />
          )}
        />
        {fieldErrors.email && (
          <FormError>{fieldErrors.email.message?.toString()}</FormError>
        )}
      </div>

      {/* Verification code field */}
      {(variant === 'signup' || variant === 'reset-password') && (
        <div className="grid gap-2">
          <Label htmlFor="verification">Verification Code</Label>
          <VerificationCodeInput
            onSendCode={handleSendCode}
            disabled={isLoading}
            control={control}
          />
          {fieldErrors.verification && (
            <FormError>
              {fieldErrors.verification.message?.toString()}
            </FormError>
          )}
        </div>
      )}

      {/* Username field */}
      {variant === 'signup' && (
        <div className="grid gap-2">
          <Label htmlFor="username">Username</Label>
          <Controller
            name="username"
            control={control}
            defaultValue={''}
            rules={{ required: 'Username is required' }}
            render={({ field }) => (
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                disabled={isLoading}
                autoComplete="username"
                {...field}
                onChange={(e) => {
                  field.onChange(e)
                  updateFormData({ username: e.target.value })
                }}
              />
            )}
          />
          {fieldErrors.username && (
            <FormError>{fieldErrors.username.message?.toString()}</FormError>
          )}
        </div>
      )}

      {/* Password field */}
      <div className="grid gap-2">
        <div className="flex items-center">
          <Label htmlFor="password">Password</Label>
          {variant === 'login' && (
            <Link
              href="/reset-password"
              onClick={(e) => {
                if (isLoading) {
                  e.preventDefault()
                  return
                }

                e.preventDefault()
                setVariant('reset-password')
              }}
              className="ml-auto text-sm underline-offset-4 hover:underline"
              aria-disabled={isLoading}
            >
              Forgot your password?
            </Link>
          )}
        </div>
        <Controller
          name="password"
          control={control}
          defaultValue={''}
          rules={{
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters',
            },
          }}
          render={({ field }) => (
            <Input
              id="password"
              type="password"
              disabled={isLoading}
              autoComplete={'password'}
              {...field}
              onChange={(e) => {
                field.onChange(e)
                updateFormData({ password: e.target.value })
              }}
            />
          )}
        />
        {fieldErrors.password && (
          <FormError>{fieldErrors.password.message?.toString()}</FormError>
        )}
      </div>

      {/* Submit button */}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Loading...' : BUTTON_TEXT[variant]}
      </Button>
    </form>
  )
}

export function SocialAuthButtons({ isLoading }: { isLoading: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          window.location.replace(googleOauthUrl)
        }}
        disabled={isLoading}
      >
        <GoogleLogoIcon className="h-4 w-4" />
        Continue with Google
      </Button>
    </div>
  )
}

export function AuthHeader({ variant }: AuthHeaderProps) {
  const title = {
    login: 'Log in to PhotoGlow',
    signup: 'Sign up for PhotoGlow',
    'reset-password': 'Reset your password',
  }[variant]

  return (
    <div className="my-6 flex flex-col space-y-1.5 text-center md:my-8">
      <div className="text-3xl leading-none font-black tracking-tight">
        {title}
      </div>
    </div>
  )
}

export function PrivacyNotice() {
  return (
    <div className="text-muted-foreground [&_a]:hover:text-primary p-2 text-center text-xs text-balance [&_a]:underline [&_a]:underline-offset-4">
      By continuing, you agree to our <a href="#">Terms of Service</a> and{' '}
      <a href="#">Privacy Policy</a>.
    </div>
  )
}

export function AuthSwitcher({
  variant,
  isLoading,
  setVariant,
}: AuthSwitcherProps) {
  const navigation = {
    login: {
      label: "Don't have an account?",
      buttonText: 'Sign up',
      href: '/signup',
    },
    signup: {
      label: 'Already have an account?',
      buttonText: 'Log in',
      href: '/login',
    },
    'reset-password': {
      label: 'Remember your password?',
      buttonText: 'Log in',
      href: '/login',
    },
  }[variant]

  return (
    <div className="flex h-14 w-full items-center justify-center gap-2 border-t text-sm">
      {navigation.label}{' '}
      <Link
        href={navigation.href}
        onClick={(e) => {
          if (isLoading) {
            e.preventDefault()
            return
          }

          e.preventDefault()
          setVariant(variant === 'login' ? 'signup' : 'login')
        }}
        className="font-bold"
      >
        {navigation.buttonText}
      </Link>
    </div>
  )
}

export function VerificationCodeInput({
  control,
  onSendCode,
  disabled,
}: VerificationCodeInputProps) {
  const [isSending, setIsSending] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const intervalRef = useRef<number | null>(null)

  const { updateFormData } = useAuthFormStore()

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const handleSendCode = async () => {
    if (isSending || cooldown > 0 || disabled) return
    setIsSending(true)
    try {
      await onSendCode()
      setCooldown(60)
      intervalRef.current = window.setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current)
              intervalRef.current = null
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (err: unknown) {
      console.error(err)
      if (err instanceof Error) {
        toast.error(err.message, { richColors: true })
      } else {
        toast.error(String(err), { richColors: true })
      }
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Controller
        name="verification"
        control={control}
        defaultValue={''}
        rules={{
          required: 'Verification code is required',
          pattern: {
            value: /^[0-9]+$/,
            message: 'Must be a numeric code',
          },
          minLength: {
            value: 6,
            message: 'Must be 6 digits',
          },
          maxLength: {
            value: 6,
            message: 'Must be 6 digits',
          },
        }}
        render={({ field }) => (
          <Input
            id="verification"
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Enter code"
            className="flex-1"
            maxLength={6}
            disabled={disabled}
            aria-label="Verification code"
            onChange={(e) => {
              field.onChange(e)
              updateFormData({ verification: e.target.value })
            }}
          />
        )}
      />
      <Button
        variant="outline"
        onClick={handleSendCode}
        disabled={isSending || cooldown > 0 || disabled}
        aria-live="polite"
      >
        {isSending
          ? 'Sending...'
          : cooldown > 0
            ? `Resend in ${cooldown}s`
            : 'Send Code'}
      </Button>
    </div>
  )
}
