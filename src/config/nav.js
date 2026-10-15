import {
  Home,
  Compass,
  Clapperboard,
  MessageCircle,
  Bell,
  Bookmark,
  Users,
  CalendarDays,
  User,
  Settings,
  PlusSquare,
  LayoutDashboard
} from 'lucide-react'

// Every route that appears in the sidebar and the left drawer
export const mainNav = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/reels', label: 'Reels', icon: Clapperboard },
  { to: '/messages', label: 'Messages', icon: MessageCircle },
  { to: '/notifications', label: 'Notifications', icon: Bell, badge: true },
  { to: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
  { to: '/communities', label: 'Communities', icon: Users },
  { to: '/events', label: 'Events', icon: CalendarDays },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, adminOnly: true }
]

// Important routes pinned at the bottom on small devices (like real social apps)
export const bottomNav = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/create', label: 'Create', icon: PlusSquare, primary: true },
  { to: '/notifications', label: 'Alerts', icon: Bell, badge: true },
  { to: '/profile', label: 'Profile', icon: User }
]
