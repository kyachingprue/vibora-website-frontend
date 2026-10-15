import { Link } from 'react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { TrendingUp } from 'lucide-react'
import { api } from '@/lib/api'
import { compact } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/ui/avatar'
export function FollowRow({ user }) {
  const qc = useQueryClient()
  const mutation = useMutation({
    mutationFn: () => api.follow(user.username, false),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['suggestions'] })
  })
  return (
    <div className="flex items-center gap-3">
      <Link to={`/profile/${user.username}`}>
        <UserAvatar user={user} className="h-10 w-10" />
      </Link>
      <Link to={`/profile/${user.username}`} className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-black dark:text-white">
          {user.name}
        </p>
        <p className="truncate text-xs text-neutral-500">@{user.username}</p>
      </Link>
      <Button
        size="sm"
        disabled={mutation.isPending}
        onClick={() => mutation.mutate()}
      >
        Follow
      </Button>
    </div>
  )
}
export default function RightSidebar() {
  const trending = useQuery({
    queryKey: ['trending'],
    queryFn: () => api.trending()
  })
  const suggestions = useQuery({
    queryKey: ['suggestions'],
    queryFn: () => api.suggestions()
  })
  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-80 shrink-0 flex-col gap-4 overflow-y-auto py-4 no-scrollbar xl:flex">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-brand-600" />
            Trending
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {trending.data?.map(t => (
            <Link
              key={t.tag}
              to={`/explore?q=${t.tag}`}
              className="block rounded-lg hover:opacity-80"
            >
              <p className="text-xs text-neutral-500">Trending topic</p>
              <p className="text-sm font-bold">#{t.tag}</p>
              <p className="text-xs text-neutral-500">
                {compact(t.posts)} posts
              </p>
            </Link>
          ))}
          {trending.data?.length === 0 && (
            <p className="text-sm text-neutral-500">No trending topics yet.</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Who to follow</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {suggestions.data?.map(u => (
            <FollowRow key={u.id} user={u} />
          ))}
          {suggestions.data?.length === 0 && (
            <p className="text-sm text-neutral-500">
              No suggestions right now.
            </p>
          )}
        </CardContent>
      </Card>
      <p className="px-2 text-xs text-neutral-500">
        © 2026 Vibora · Privacy · Terms · About
      </p>
    </aside>
  )
}
