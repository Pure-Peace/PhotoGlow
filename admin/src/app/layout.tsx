import '@/styles/globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import NextTopLoader from 'nextjs-toploader'
import { ThemeProvider } from '@/components/theme/theme-provider'
import { Toaster } from 'sonner'
import { AdminProvider } from '@/contexts/admin-context'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PhotoGlow Admin',
  description: 'Admin dashboard for PhotoGlow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'bg-background min-h-screen font-sans antialiased',
          inter.className
        )}
      >
        <NextTopLoader color="#6d28d9" showSpinner={false} />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AdminProvider>{children}</AdminProvider>
          <Toaster position="bottom-center" offset={50} duration={3000} />
        </ThemeProvider>
      </body>
    </html>
  )
}
