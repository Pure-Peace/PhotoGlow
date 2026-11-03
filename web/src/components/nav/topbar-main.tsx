'use client'

import Link from 'next/link'
import { Search } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeButton } from '@/components/theme/theme-button'
import { AuthButton } from '@/components/auth/auth-button'
import { HeaderDrawerMenu } from './mobile-drawer'
import React, { useState } from 'react'

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Link href="/" className="flex items-center gap-1.5">
        <div className="bg-primary flex size-9 items-center justify-center rounded-full">
          <span className="text-primary-foreground text-sm font-bold">PG</span>
        </div>
        <span className="inline-block text-xl font-extrabold">PhotoGlow</span>
      </Link>
    </div>
  )
}

export function SearchBar() {
  const router = useRouter()
  const pathname = usePathname()
  const [query, setQuery] = useState('')
  // Hide search bar on search page
  if (pathname === '/search') {
    return null
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const query = formData.get('search')?.toString().trim()
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
      setQuery('')
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="search"
            name="search"
            placeholder="Search photos, people or tags..."
            className="bg-muted/50 w-full rounded-full border-none px-4 pr-12"
            value={query}
            onChange={handleSearchChange}
            required
          />
          {query.length > 0 && (
            <div className="text-muted-foreground absolute -bottom-6 left-4 text-xs select-none">
              Enter to search
            </div>
          )}
        </div>
        <Button
          type="submit"
          variant="ghost"
          className="text-muted-foreground absolute top-0 right-0 rounded-full"
          size="icon"
        >
          <Search />
        </Button>
      </form>
    </div>
  )
}

export function SiteHeader() {
  return (
    <header className="bg-background/80 supports-[backdrop-filter]:bg-background/50 sticky top-0 z-50 w-full backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-2 md:px-4">
        {/* logo */}
        <Logo />

        {/* search bar */}
        <div className="mx-auto hidden w-full max-w-md items-center px-2 md:flex">
          <SearchBar />
        </div>

        {/* auth button and theme/menu buttons */}
        <div className="flex items-center gap-3">
          <AuthButton
            variant="default"
            className="inline-block gap-4 rounded-full"
          >
            <span className="font-semibold">Log in</span>
          </AuthButton>

          {/* theme button  */}
          <div className="hidden md:block">
            <ThemeButton />
          </div>

          <div>
            <Button asChild variant="ghost" size="icon" className="md:hidden">
              <Link href={'/search'}>
                <Search />
              </Link>
            </Button>

            {/* menu button  */}
            <HeaderDrawerMenu />
          </div>
        </div>
      </div>
    </header>
  )
}
