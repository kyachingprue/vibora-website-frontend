import { useState, useEffect } from 'react'
import { NavLink, Outlet, Link, useLocation } from 'react-router'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'motion/react'
import {
  LayoutDashboard,
  Users,
  BarChart3,
  FileText,
  Settings,
  Menu,
  X,
  Shield,
  ChevronLeft
} from 'lucide-react'
import { TbLayoutSidebarLeftCollapseFilled } from 'react-icons/tb'
import { connectSocket, onPresence } from '@/lib/socket'
import { UserAvatar } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { ThemeCycleButton } from '@/components/ThemeToggle'

const NAV = [
  { to: '/admin', end: true, label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/posts', label: 'Posts', icon: FileText },
  { to: '/admin/settings', label: 'Settings', icon: Settings }
]

export default function AdminLayout() {
  const user = useSelector(s => s.auth.user)
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [onlineCount, setOnlineCount] = useState(0)

  useEffect(() => {
    connectSocket()
    const cleanup = onPresence({
      adminUpdate: payload => {
        if (typeof payload?.onlineCount === 'number') {
          setOnlineCount(payload.onlineCount)
        }
      }
    })
    return () => {
      cleanup()
      // keep socket for app; don't disconnect on admin leave
    }
  }, [])

  const Sidebar = ({ mobile = false }) => (
    <motion.aside
      initial={false}
      animate={{
        width: mobile ? 288 : collapsed ? 72 : 256
      }}
      transition={{
        width: {
          duration: 0.35,
          ease: [0.22, 1, 0.36, 1]
        }
      }}
      className={cn(
        'relative flex h-full flex-col overflow-hidden border-r border-white/10 text-white',
        'bg-gradient-to-b from-[#17102f] via-[#17152f] to-[#0b1224]',
        'shadow-xl shadow-violet-950/10',
        mobile ? 'w-72' : ''
      )}
    >
      {/* Ambient gradient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute -right-20 top-1/3 h-48 w-48 rounded-full bg-fuchsia-500/10 blur-3xl" />
        <div className="absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      {/* Brand */}
      <div className="relative flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-5">
        <motion.div
          whileHover={{ rotate: 8, scale: 1.08 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-blue-500 shadow-lg shadow-violet-500/25"
        >
          <Shield className="h-5 w-5 text-white" />
        </motion.div>

        <AnimatePresence initial={false}>
          {(!collapsed || mobile) && (
            <motion.div
              key="brand-title"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="min-w-0 flex-1 whitespace-nowrap"
            >
              <p className="bg-gradient-to-r from-white via-violet-100 to-fuchsia-200 bg-clip-text text-sm font-extrabold tracking-tight text-transparent">
                Vibora Admin
              </p>
              <p className="mt-0.5 text-[10px] font-medium tracking-[0.18em] text-violet-300/70">
                CONTROL CENTER
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {mobile && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            type="button"
            className="ml-auto rounded-lg p-2 text-neutral-300 transition-colors hover:bg-white/10 hover:text-white"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </motion.button>
        )}
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 space-y-1.5 overflow-y-auto overflow-x-hidden p-3">
        <AnimatePresence initial={false}>
          {(!collapsed || mobile) && (
            <motion.p
              key="nav-heading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="mb-3 px-3 pt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500"
            >
              Workspace
            </motion.p>
          )}
        </AnimatePresence>

        {NAV.map(({ to, end, label, icon: Icon }, index) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => mobile && setOpen(false)}
            title={collapsed && !mobile ? label : undefined}
            className="group relative block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            {({ isActive }) => (
              <motion.div
                initial={false}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.18 }}
                className={cn(
                  'relative flex min-h-11 items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5',
                  'text-sm font-medium',
                  isActive
                    ? 'text-white'
                    : 'text-neutral-400 hover:bg-white/[0.06] hover:text-white'
                )}
              >
                {/* Active gradient background */}
                {isActive && (
                  <motion.div
                    layoutId={
                      mobile ? 'mobile-admin-active' : 'desktop-admin-active'
                    }
                    className="absolute inset-0 rounded-xl border border-white/10 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 shadow-lg shadow-violet-950/30"
                    transition={{
                      type: 'spring',
                      stiffness: 350,
                      damping: 30
                    }}
                  />
                )}

                {/* Subtle active glow */}
                {isActive && (
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
                )}

                <motion.span
                  animate={{
                    scale: isActive ? 1.05 : 1,
                    color: isActive ? '#ffffff' : '#a3a3a3'
                  }}
                  transition={{ duration: 0.2 }}
                  className="relative z-10 flex shrink-0 items-center justify-center"
                >
                  <Icon className="h-5 w-5" />
                </motion.span>

                <AnimatePresence initial={false}>
                  {(!collapsed || mobile) && (
                    <motion.span
                      key={`label-${label}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{
                        duration: 0.2,
                        delay: isActive ? 0.03 : index * 0.015
                      }}
                      className="relative z-10 flex-1 whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {isActive && (!collapsed || mobile) && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 h-1.5 w-1.5 shrink-0 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                  />
                )}
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="relative shrink-0 border-t border-white/10 p-3">
        <AnimatePresence initial={false}>
          {(!collapsed || mobile) && (
            <motion.div
              key="presence"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.2 }}
              className="mb-3 flex items-center gap-2 rounded-xl border border-emerald-400/10 bg-emerald-400/[0.06] px-3 py-2.5"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>

              <div className="min-w-0">
                <p className="text-xs font-semibold text-emerald-300">
                  {onlineCount > 0
                    ? `${onlineCount} online now`
                    : 'Presence live'}
                </p>
                <p className="mt-0.5 text-[10px] text-neutral-500">
                  Community status
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Link
          to="/"
          onClick={() => mobile && setOpen(false)}
          title={collapsed && !mobile ? 'Back to app' : undefined}
          className="group flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-400 transition-colors duration-200 hover:bg-white/[0.07] hover:text-white"
        >
          <motion.span whileHover={{ x: -3 }} className="shrink-0">
            <ChevronLeft className="h-5 w-5" />
          </motion.span>

          <AnimatePresence initial={false}>
            {(!collapsed || mobile) && (
              <motion.span
                key="back-label"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="whitespace-nowrap"
              >
                Back to app
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>
    </motion.aside>
  )

  return (
    <div className="flex min-h-screen bg-neutral-100 dark:bg-neutral-950">
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{
          width: {
            duration: 0.35,
            ease: [0.22, 1, 0.36, 1]
          }
        }}
        className="sticky top-0 hidden h-screen shrink-0 overflow-hidden border-r border-neutral-200 bg-neutral-950 text-white md:block dark:border-neutral-800"
      >
        <Sidebar />
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-admin-drawer"
            className="fixed inset-0 z-50 md:hidden"
            initial="closed"
            animate="open"
            exit="closed"
            variants={{
              open: {
                transition: {
                  staggerChildren: 0.04
                }
              },
              closed: {
                transition: {
                  staggerChildren: 0.03,
                  staggerDirection: -1
                }
              }
            }}
          >
            {/* Background overlay */}
            <motion.button
              type="button"
              aria-label="Close navigation menu"
              onClick={() => setOpen(false)}
              className="absolute inset-0 h-full w-full cursor-default bg-neutral-950/60 backdrop-blur-[3px]"
              variants={{
                closed: { opacity: 0 },
                open: { opacity: 1 }
              }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            />

            {/* Sliding sidebar */}
            <motion.div
              className="absolute inset-y-0 left-0 z-10 w-72 max-w-[85vw] shadow-2xl shadow-black/30"
              variants={{
                closed: {
                  x: '-100%',
                  opacity: 0.7
                },
                open: {
                  x: 0,
                  opacity: 1
                }
              }}
              transition={{
                type: 'spring',
                stiffness: 320,
                damping: 32,
                mass: 0.8
              }}
            >
              <Sidebar mobile />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-neutral-200 bg-white/90 px-4 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/90">
          <button
            type="button"
            className="rounded-lg p-2 hover:bg-neutral-100 md:hidden dark:hover:bg-neutral-800"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="hidden rounded-lg p-2 hover:bg-neutral-100 md:inline-flex dark:hover:bg-neutral-800"
            onClick={() => setCollapsed(c => !c)}
            aria-label="Toggle sidebar"
          >
            <TbLayoutSidebarLeftCollapseFilled className="h-5 w-5 md:h-6 md:w-6" />
          </button>
          <div className="flex-1" />
          <ThemeCycleButton />
          <div className="flex items-center md:gap-2 rounded-full border border-neutral-200 py-1 pl-1 pr-1 md:pr-3 dark:border-neutral-700">
            <UserAvatar user={user} className="h-8 w-8 object-cover" />
            <span className="hidden text-sm font-semibold sm:inline">
              {user?.name}
            </span>
          </div>
        </header>
        <main className="relative isolate flex-1 overflow-hidden bg-gradient-to-br from-violet-50 via-white to-blue-50 p-4 sm:p-6 dark:from-neutral-950 dark:via-neutral-900 dark:to-indigo-950/40">
          {/* Decorative gradient */}
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-400/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  )
}
