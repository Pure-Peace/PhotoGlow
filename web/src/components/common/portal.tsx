'use client'

import { Slot } from '@radix-ui/react-slot'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export type PortalReceiverProps = {
  portalKey: string
  asChild?: boolean
}

export type PortalProps = {
  children: React.ReactNode
  container: (
    get: (portalKey: string) => HTMLElement | null
  ) => HTMLElement | null
}

export const baseReceiverId = 'portal-receiver'

export const containerId = (portalKey: string) =>
  `${baseReceiverId}-${portalKey}`

export const usePortal = () => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const Portal = ({ children, container }: PortalProps) => {
    if (!mounted) return null

    const get = (portalKey: string) =>
      document.getElementById(containerId(portalKey))

    const ct = container(get)
    if (!ct) return null

    return createPortal(children, ct)
  }

  return Portal
}

export const PortalReceiver = ({
  portalKey,
  asChild,
  ...props
}: React.ComponentProps<'div'> & PortalReceiverProps) => {
  const Comp = asChild ? Slot : 'div'

  return <Comp id={containerId(portalKey)} {...props} />
}
