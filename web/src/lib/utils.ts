import { clsx, type ClassValue } from 'clsx'
import { toast } from 'sonner'
import { twMerge } from 'tailwind-merge'

// API configuration
export const API_URL =
  typeof window === 'undefined'
    ? process.env.INTERNAL_API_URL
    : process.env.NEXT_PUBLIC_API_URL

// Helper function to build API URLs
export const buildUrl = (path: string) => `${API_URL}/api/v1/${path}`

export const googleOauthUrl = buildUrl('auth/google')

export const authorizationHeader = (accessToken?: string) =>
  accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function downloadFile(url: string, filename: string) {
  const link = document.createElement('a')
  link.download = filename
  link.href = url
  link.click()
}

export function downloadFileFromBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  downloadFile(url, filename)
}

export function downloadFileFromDataUrl(
  dataUrl: string,
  filename: string,
  type: string
) {
  const blob = new Blob([dataUrl], { type })
  downloadFileFromBlob(blob, filename)
}

export async function canvasToBlob(
  canvas?: HTMLCanvasElement,
  type?: string,
  quality?: number
) {
  if (!canvas) return null

  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          resolve(null)
        }
      },
      type,
      quality
    )
  })
}

export function tryParseJson<T>(text: string): T | null {
  try {
    return JSON.parse(text)
  } catch (e) {
    return null
  }
}

export async function respError(res: Response) {
  if (res.status === 404) {
    return new Error(`Not Found (${res.status})`)
  }

  let e = 'unknown error'

  const resText = await res.text()
  const err = tryParseJson<{ error?: string; message?: string }>(resText)

  if (err?.error) {
    // 1. Server side JSON error
    e = `${err.message || err.error}`
  } else if (resText) {
    // 2. Server side error message
    e = `(2) ${resText} (${res.status})`
  } else {
    // 3. Default error
    e = `(3) ${res.statusText} (${res.status})`
  }

  console.error(e)
  return new Error(e)
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const createThumbnail = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_THUMB_SIZE = 140
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_THUMB_SIZE) {
            height = height * (MAX_THUMB_SIZE / width)
            width = MAX_THUMB_SIZE
          }
        } else {
          if (height > MAX_THUMB_SIZE) {
            width = width * (MAX_THUMB_SIZE / height)
            height = MAX_THUMB_SIZE
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/png', 1))
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

export function reorder<T>(list: T[], startIndex: number, endIndex: number) {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)
  return result
}

export function debounce(func: any, delay: number) {
  let timeoutId: NodeJS.Timeout | null = null

  const debouncedFunction = (...args: any[]) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      func(...args)
      timeoutId = null
    }, delay)
  }

  debouncedFunction.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  return debouncedFunction
}

export const shareRoute = (route: string) => {
  const url = `${window.location.origin}${route}`
  try {
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success('Link copied to clipboard'))
      .catch(() => toast.error('Failed to copy link'))
  } catch (_) {
    toast.error('Failed to copy link')
  }
}
