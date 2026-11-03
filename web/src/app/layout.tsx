import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import NextTopLoader from 'nextjs-toploader'

import { ThemeProvider } from '@/components/theme/theme-provider'
import { AuthDialog } from '@/components/auth/auth-dialog'
import { ssrAuth } from '@/lib/auth'
import { AuthProvider } from '@/components/auth/auth-provider'
import { LogoutDialog } from '@/components/auth/logout-dialog'
import { Toaster } from '@/components/ui/sonner'
import { PostDialog } from '@/components/post/post-dialog'
import { UploadDialog } from '@/components/upload/upload-dialog'
import { SSRAuthProvider } from './context/ssr-auth-context'
import { NotificationProvider } from '@/components/notifications/notification-provider'
import { MainLayout } from '@/components/main-layout'

const inter = Inter({
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'PhotoGlow',
  description: 'Welcome to PhotoGlow! - Let your moments glow in the cloud',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const authData = await ssrAuth()

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.className} antialiased`}
    >
      <body>
        <NextTopLoader />
        <SSRAuthProvider ssrAuth={authData}>
          <AuthProvider />
          <NotificationProvider />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <MainLayout>{children}</MainLayout>
            <AuthDialog />
            <LogoutDialog />
            <PostDialog />
            <UploadDialog />
            <Toaster position="bottom-center" offset={50} duration={3000} />
          </ThemeProvider>
        </SSRAuthProvider>
      </body>
    </html>
  )
}
