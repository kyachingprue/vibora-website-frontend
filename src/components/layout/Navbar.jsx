import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { useQuery } from '@tanstack/react-query'
import {
  Menu,
  Search,
  MessageCircle,
  Bell,
  LayoutDashboard,
  X
} from 'lucide-react'
import { openDrawer } from '@/store/uiSlice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserAvatar } from '@/components/ui/avatar'
import { ThemeCycleButton } from '@/components/ThemeToggle'
import { api } from '@/lib/api'
import logo from '../../assets/web-logo.png'

export function Logo({ className = '' }) {
  return (
    <Link to="/" className={`flex items-center ${className}`}>
      <img
        src={logo}
        alt="Vibora"
        className="h-8 w-8 object-cover md:h-10 md:w-10 lg:h-12 lg:w-12"
      />
      <span className="text-md font-extrabold tracking-tight text-black dark:text-white lg:text-xl">
        Vibora
      </span>
    </Link>
  )
}

export default function Navbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(s => s.auth.user)
  const [q, setQ] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const search = useQuery({
    queryKey: ['navbar-user-search', q],
    queryFn: () => api.searchUsers(q.trim()),
    enabled: q.trim().length >= 2,
    staleTime: 15000
  })
  const unread = useQuery({
    queryKey: ['notification-unread-count'],
    queryFn: api.unreadNotificationCount,
    enabled: Boolean(user),
    refetchInterval: 15000,
    staleTime: 5000
  })
  const onSearch = e => {
    e.preventDefault()
    if (q.trim()) {
      navigate(`/explore?q=${encodeURIComponent(q.trim())}`)
      setSearchOpen(false)
    }
  }
  useEffect(() => {
    if (!q.trim()) setSearchOpen(false)
    else setSearchOpen(true)
  }, [q])
  const isAdmin = ['admin', 'administrator'].includes(
    String(user?.role || '').toLowerCase()
  )
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur-xl dark:border-neutral-800 dark:bg-neutral-950/90">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:gap-3 sm:px-4">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open menu"
          onClick={() => dispatch(openDrawer())}
          className="sm:hidden"
        >
          <Menu className="h-6 w-6" />
        </Button>
        <Logo />
        <form
          onSubmit={onSearch}
          className="relative mx-auto hidden w-full max-w-md sm:block"
        >
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <Input
            value={q}
            onFocus={() => q.trim() && setSearchOpen(true)}
            onChange={e => setQ(e.target.value)}
            placeholder="Search people by name or username"
            className="pl-10 pr-9"
            aria-label="Search users"
          />
          {q && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setQ('')
                setSearchOpen(false)
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {searchOpen && q.trim().length >= 2 && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-2 shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
              {search.isPending ? (
                <p className="p-3 text-sm text-neutral-500">Searching users…</p>
              ) : search.isError ? (
                <p className="p-3 text-sm text-red-500">
                  {search.error.message}
                </p>
              ) : search.data?.length ? (
                search.data.map(person => (
                  <Link
                    key={person.id}
                    to={`/profile/${person.username}`}
                    onClick={() => {
                      setQ('')
                      setSearchOpen(false)
                    }}
                    className="flex items-center gap-3 rounded-xl p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <UserAvatar user={person} className="h-10 w-10" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">
                        {person.name}
                      </span>
                      <span className="block truncate text-xs text-neutral-500">
                        @{person.username}
                      </span>
                    </span>
                  </Link>
                ))
              ) : (
                <p className="p-3 text-sm text-neutral-500">
                  No accounts found.
                </p>
              )}
              <button
                type="submit"
                className="w-full rounded-lg p-2 text-left text-xs font-semibold text-brand-600 hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                See all results for “{q}”
              </button>
            </div>
          )}
        </form>
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden"
            aria-label="Search"
            onClick={() => navigate('/explore')}
          >
            <Search className="h-5 w-5" />
          </Button>
          <ThemeCycleButton />
          {isAdmin && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Admin dashboard"
              title="Admin dashboard"
              onClick={() => navigate('/admin')}
            >
              <LayoutDashboard className="h-5 w-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Messages"
            onClick={() => navigate('/messages')}
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Notifications${unread.data || 0 ? `, ${unread.data} unread` : ''}`}
            className="relative"
            onClick={() => navigate('/notifications')}
          >
            <Bell className="h-5 w-5" />
            {(unread.data || 0) > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-neutral-950">
                {unread.data > 99 ? '99+' : unread.data}
              </span>
            )}
          </Button>
          {user && (
            <Link to="/profile" aria-label="Your profile" className="ml-1">
              <UserAvatar user={user} className="h-8 w-8" />
            </Link>
          )}
        </div>
      </div>
      {searchOpen && (
        <button
          aria-label="Close search suggestions"
          className="fixed inset-14 z-30 hidden sm:block"
          onClick={() => setSearchOpen(false)}
        />
      )}
    </header>
  )
}
