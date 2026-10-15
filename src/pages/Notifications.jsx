import { Link } from 'react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'motion/react'
import {
  Heart,
  UserPlus,
  MessageCircle,
  AtSign,
  CheckCheck,
  BellOff
} from 'lucide-react'
import SEO from '@/components/SEO'
import PageHeader from '@/components/PageHeader'
import { timeAgo, cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/ui/avatar'
import { api } from '@/lib/api'
import { ContentSkeleton } from '@/components/loading/PageLoader'
const ICONS = {
  LIKE: { icon: Heart, color: 'bg-pink-500', text: 'liked your post' },
  FOLLOW: {
    icon: UserPlus,
    color: 'bg-brand-600',
    text: 'started following you'
  },
  COMMENT: {
    icon: MessageCircle,
    color: 'bg-sky-500',
    text: 'commented on your post'
  },
  MENTION: { icon: AtSign, color: 'bg-emerald-500', text: 'mentioned you' }
}
export default function Notifications() {
  const qc = useQueryClient()
  const q = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.notifications(),
    refetchInterval: 15000
  })
  const read = useMutation({
    mutationFn: () => api.markAllNotificationsRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['notification-unread-count'] })
    }
  })
  const clear = useMutation({
    mutationFn: () => api.clearNotifications(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['notification-unread-count'] })
    }
  })
  const markOne = useMutation({
    mutationFn: id => api.markNotificationRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['notification-unread-count'] })
    }
  })
  const items = q.data || []
  const unread = items.filter(n => !n.read).length
  return (
    <>
      <SEO
        title="Notifications"
        description="Likes, follows, comments and mentions."
      />
      <PageHeader title="Notifications" subtitle={`${unread} unread`}>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => read.mutate()}
            disabled={!unread || read.isPending}
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => clear.mutate()}
            disabled={!items.length || clear.isPending}
          >
            Clear
          </Button>
        </div>
      </PageHeader>
      {q.isPending ? (
        <ContentSkeleton rows={5} />
      ) : items.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 py-16 text-neutral-500">
          <BellOff className="h-10 w-10" />
          <p>You’re all caught up.</p>
        </Card>
      ) : (
        <Card className="divide-y divide-neutral-200 overflow-hidden dark:divide-neutral-800">
          {items.map((n, i) => {
            const cfg = ICONS[n.type] || ICONS.COMMENT
            const Icon = cfg.icon
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  onClick={() => {
                    if (!n.read) markOne.mutate(n.id)
                  }}
                  to={
                    n.postId
                      ? `/post/${n.postId}`
                      : `/profile/${n.actor?.username || ''}`
                  }
                  className={cn(
                    'flex items-center gap-3 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800/60',
                    !n.read && 'bg-brand-50/70 dark:bg-brand-600/10'
                  )}
                >
                  <div className="relative">
                    <UserAvatar user={n.actor} className="h-12 w-12" />
                    <span
                      className={cn(
                        'absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-white ring-2 ring-white dark:ring-neutral-900',
                        cfg.color
                      )}
                    >
                      <Icon className="h-3 w-3" />
                    </span>
                  </div>
                  <p className="flex-1 text-sm">
                    <span className="font-bold">
                      {n.actor?.name || 'Someone'}
                    </span>{' '}
                    {cfg.text}
                  </p>
                  <span className="text-xs text-neutral-500">
                    {timeAgo(new Date(n.createdAt).getTime())}
                  </span>
                  {!n.read && (
                    <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />
                  )}
                </Link>
              </motion.div>
            )
          })}
        </Card>
      )}
      {(q.isError || read.isError || clear.isError) && (
        <p className="mt-3 text-sm text-red-500">
          {q.error?.message || read.error?.message || clear.error?.message}
        </p>
      )}
    </>
  )
}
