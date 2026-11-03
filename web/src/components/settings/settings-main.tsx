'use client'

import { Separator } from '@/components/ui/separator'
import { ChangePasswordForm, ResetPasswordForm } from './settings-form'
import { ChangeEmailForm } from './settings-form'
import { Card, CardContent } from '@/components/ui/card'
import { Fragment, useEffect, useState } from 'react'
import { cn, googleOauthUrl } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'
import { BlockedUsersList } from './blocked-users'
import { Button } from '../ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { api } from '@/api'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { GoogleLogoIcon } from '../ui/google'

export type SectionProps = {
  title: string
} & React.HTMLAttributes<HTMLDivElement>

const settingSections = [
  {
    Component: ThirdPartyAccountsSection,
    title: 'Third Party Accounts',
    id: 'third-party-accounts',
  },
  {
    Component: ChangePasswordSection,
    title: 'Change Password',
    id: 'change-password',
  },
  {
    Component: ResetPasswordSection,
    title: 'Reset Password',
    id: 'reset-password',
  },
  { Component: ChangeEmailSection, title: 'Change Email', id: 'change-email' },
  {
    Component: BlockedUsersSection,
    title: 'Blocked Users',
    id: 'blocked-users',
  },
  {
    Component: DeleteAccountSection,
    title: 'Delete Account',
    id: 'delete-account',
  },
]

const userInfoSections = [
  { Component: UserInfoSection, title: 'User Info', id: 'user-info' },
]

const allSections = [...userInfoSections, ...settingSections]

export function SettingsMain() {
  return (
    <div className="relative container mx-auto flex flex-col gap-8 px-4 py-8 md:flex-row">
      {/* Setting navigation - fixed on the left */}
      <div className="w-full flex-shrink-0 md:w-60">
        <SettingNavigation className="w-full md:fixed md:w-60" />
      </div>

      {/* Setting content - scrollable on the right */}
      <div className="flex flex-1 flex-col gap-4">
        <UserCard />
        <SettingCard />
      </div>
    </div>
  )
}

export function UserCard({ className }: { className?: string }) {
  return (
    <Card className={cn('max-w-2xl', className)}>
      <CardContent className="p-6 sm:p-8">
        {/* title */}
        <h1 className="mb-8 text-3xl font-bold">Your Account</h1>

        {/* user info sections */}
        <div className="space-y-12">
          {userInfoSections.map(({ Component, id, title }, index) => (
            <Fragment key={id}>
              <Component id={id} title={title} className="scroll-mt-56" />
              {index !== userInfoSections.length - 1 && <Separator />}
            </Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function SettingCard({ className }: { className?: string }) {
  return (
    <Card className={cn('max-w-2xl', className)}>
      <CardContent className="p-6 sm:p-8">
        {/* title */}
        <h1 className="mb-8 text-3xl font-bold">Settings</h1>

        {/* Setting sections */}
        <div className="space-y-12">
          {settingSections.map(({ Component, id, title }, index) => (
            <Fragment key={id}>
              <Component id={id} title={title} className="scroll-mt-56" />
              {index !== settingSections.length - 1 && <Separator />}
            </Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function ChangePasswordSection({ title, ...props }: SectionProps) {
  return (
    <section className="space-y-4" {...props}>
      <div className="py-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Update your password to keep your account secure
        </p>
      </div>
      <ChangePasswordForm />
    </section>
  )
}

export function ChangeEmailSection({ title, ...props }: SectionProps) {
  return (
    <section className="space-y-4" {...props}>
      <div className="py-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Update your email address. You&apos;ll need to verify your new email.
        </p>
      </div>
      <ChangeEmailForm />
    </section>
  )
}

export function ResetPasswordSection({ title, ...props }: SectionProps) {
  return (
    <section className="space-y-4" {...props}>
      <div className="py-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Reset your password with your email
        </p>
      </div>
      <ResetPasswordForm />
    </section>
  )
}

export function ThirdPartyAccountsSection({ title, ...props }: SectionProps) {
  const { accessToken } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [oauthAccounts, setOauthAccounts] = useState<{
    google: boolean
    github: boolean
    twitter: boolean
    facebook: boolean
  }>({
    google: false,
    github: false,
    twitter: false,
    facebook: false,
  })

  useEffect(() => {
    if (!accessToken) return

    setIsLoading(true)

    api
      .getOauthAccounts(accessToken)
      .then(setOauthAccounts)
      .finally(() => setIsLoading(false))
  }, [accessToken])

  const text = oauthAccounts.google ? 'Unlink' : 'Link'

  const handleLink = () => {
    if (!accessToken) {
      toast.error('You must be logged in to link your Google account')
      return
    }

    window.location.replace(`${googleOauthUrl}?token=${accessToken}`)
  }

  const handleUnlink = () => {
    if (!accessToken) {
      toast.error('You must be logged in to unlink your Google account')
      return
    }

    setIsLoading(true)

    api
      .deleteGoogleOAuth(accessToken)
      .then(() => {
        toast.success('Google account unlinked')
        setOauthAccounts({ ...oauthAccounts, google: false })
      })
      .finally(() => setIsLoading(false))
  }

  return (
    <section className="space-y-4" {...props}>
      <div className="py-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your third party accounts
        </p>
      </div>
      <div className="mt-4">
        <div className="p-2 text-sm">
          Google Account:{' '}
          {oauthAccounts.google
            ? `${oauthAccounts.google}`
            : `${isLoading ? 'loading...' : 'Not linked'}`}
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full" disabled={isLoading}>
              <GoogleLogoIcon className="h-4 w-4" />
              {isLoading ? 'Loading...' : `${text} Google Account`}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{text} Google Account</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to {text} your Google account?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={oauthAccounts.google ? handleUnlink : handleLink}
                disabled={isLoading}
              >
                Continue {text}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </section>
  )
}

export function DeleteAccountSection({ title, ...props }: SectionProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { accessToken, clearAuth } = useAuthStore()
  const router = useRouter()

  const handleDelete = async () => {
    if (!accessToken) {
      toast.error('You must be logged in to delete your account')
      return
    }

    setIsDeleting(true)
    try {
      await api.deleteUser(accessToken)
      clearAuth()
      toast.success('Account deleted successfully')
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Failed to delete account:', error)
      toast.error('Failed to delete account')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <section className="space-y-4" {...props}>
      <div className="py-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Permanently delete your account. This action cannot be undone.
        </p>
      </div>
      <div className="pt-6">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="text-destructive w-full">
              Delete Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove all of your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive hover:bg-destructive/90 text-white"
              >
                {isDeleting ? 'Deleting...' : 'Delete Account'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </section>
  )
}

export function BlockedUsersSection({ title, ...props }: SectionProps) {
  return (
    <section className="space-y-4" {...props}>
      <div className="py-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage users you&apos;ve blocked from interacting with you
        </p>
      </div>
      <BlockedUsersList />
    </section>
  )
}

export function SettingNavigation({ className }: { className?: string }) {
  const [activeSections, setActiveSections] = useState<Set<string>>(new Set())

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setActiveSections((prev) => {
            const newSet = new Set(prev)
            if (entry.isIntersecting) {
              newSet.add(entry.target.id)
            } else {
              newSet.delete(entry.target.id)
            }
            return newSet
          })
        })
      },
      {
        rootMargin: '-10% 0px -10% 0px',
        threshold: [0, 0.1, 0.5, 1],
      }
    )

    // Observe all sections
    allSections.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => {
      allSections.forEach(({ id }) => {
        const element = document.getElementById(id)
        if (element) observer.unobserve(element)
      })
    }
  }, [])

  const handleNavigation = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav
      className={cn(
        'bg-background/95 flex flex-col rounded-lg border p-2',
        className
      )}
    >
      {/* navigation items */}
      {allSections.map(({ title, id }) => (
        <button
          key={id}
          onClick={() => handleNavigation(id)}
          className={cn(
            'px-4 py-2 text-left text-sm font-medium transition-all duration-200',
            'hover:bg-accent/10 hover:pl-5',
            activeSections.has(id)
              ? ['bg-accent/5 text-foreground pl-5 font-bold']
              : 'text-muted-foreground'
          )}
        >
          {title}
        </button>
      ))}
    </nav>
  )
}

export function UserInfoSection({ title, ...props }: SectionProps) {
  const { user, isReady } = useAuthStore()

  return (
    <section className="space-y-4" {...props}>
      <div className="py-2">
        <h2 className="pb-4 text-xl font-semibold">{title}</h2>
        <div className="text-muted-foreground">
          Username: {isReady ? user?.username : 'Loading...'}
        </div>
        <div className="text-muted-foreground">
          Email: {isReady ? user?.email : 'Loading...'}
        </div>
      </div>
    </section>
  )
}
