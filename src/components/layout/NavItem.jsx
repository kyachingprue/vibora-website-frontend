import { NavLink } from 'react-router'
import { useSelector } from 'react-redux'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'

export default function NavItem({ item, onClick }) {
  const user = useSelector(s => s.auth.user)
  const unreadQuery = useQuery({
    queryKey: ['notification-unread-count'],
    queryFn: api.unreadNotificationCount,
    enabled: Boolean(user) && Boolean(item.badge),
    refetchInterval: 15000,
    staleTime: 5000
  })
  const unread = unreadQuery.data || 0
  if (
    item.adminOnly &&
    !['admin', 'administrator'].includes(String(user?.role || '').toLowerCase())
  )
    return null
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-semibold transition-colors',
          isActive
            ? 'bg-brand-50 text-brand-700 dark:bg-brand-600/20 dark:text-brand-400'
            : 'text-black hover:bg-neutral-100 dark:text-white dark:hover:bg-neutral-800'
        )
      }
    >
      <span className="relative">
        <Icon className="h-5 w-5" />
        {item.badge && unread > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-pink-500 px-1 text-[9px] font-bold text-white ring-2 ring-white dark:ring-neutral-950">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </span>
      {item.label}
      {item.badge && unread > 0 && (
        <span className="ml-auto rounded-full bg-pink-500 px-2 py-0.5 text-xs font-bold text-white">
          {unread > 99 ? '99+' : unread}
        </span>
      )}
    </NavLink>
  )
}
