import { Bell, MessageCircle, Settings } from 'lucide-react'
import { Compass, Search } from 'lucide-react'
import { UserCircle } from 'lucide-react'
import { Home } from 'lucide-react'

export const NAV_ITEM_LIST = [
  {
    href: '/',
    icon: <Home className="h-5 w-5" />,
    label: 'For You',
  },
  {
    href: '/following',
    icon: <UserCircle className="h-5 w-5" />,
    label: 'Following',
  },
  {
    href: '/explore',
    icon: <Compass className="h-5 w-5" />,
    label: 'Explore',
  },
  {
    href: '/search',
    icon: <Search className="h-5 w-5" />,
    label: 'Search',
  },
  {
    href: '/notifications',
    icon: <Bell className="h-5 w-5" />,
    label: 'Notifications',
  },
  {
    href: '/chat',
    icon: <MessageCircle className="h-5 w-5" />,
    label: 'Chat',
    auth: true,
  },
]

export const DROPDOWN_MOBILE_ONLY = [
  {
    href: '/settings',
    icon: <Settings className="h-5 w-5" />,
    label: 'Settings',
    auth: true,
  },
]
