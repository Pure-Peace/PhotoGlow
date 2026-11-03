'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="bg-background text-foreground flex min-h-full w-full flex-col items-center justify-center overflow-hidden p-4">
      <div className="space-y-6 text-center">
        {/* 404 Text */}
        <h1 className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-8xl font-black text-transparent md:text-[12rem] dark:from-purple-400 dark:to-pink-400">
          404
        </h1>

        {/* Description */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold md:text-3xl">
            Oops! Page Not Found
          </h2>
          <p className="text-muted-foreground mx-auto max-w-md text-base md:text-lg">
            {"The page you're looking for doesn't exist or has been moved."}
          </p>
        </div>

        {/* Button */}
        <div>
          <Button
            asChild
            variant="default"
            className="rounded-full px-8 py-6 text-lg shadow-lg transition-all duration-300 hover:shadow-xl"
          >
            <Link href="/">Take Me Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
