import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Search, Trash2, RefreshCw } from 'lucide-react'
import { api } from '@/lib/api'
import SEO from '@/components/SEO'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/ui/avatar'

export default function AdminPosts() {
  const qc = useQueryClient()
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [confirm, setConfirm] = useState(null)

  const posts = useQuery({
    queryKey: ['admin-posts', q, page],
    queryFn: () => api.adminPosts({ q, page }),
    retry: false
  })

  const del = useMutation({
    mutationFn: api.adminDeletePost,
    onMutate: () => toast.loading('Deleting post…', { id: 'pdel' }),
    onSuccess: () => {
      toast.success('Post deleted', { id: 'pdel' })
      setConfirm(null)
      qc.invalidateQueries({ queryKey: ['admin-posts'] })
      qc.invalidateQueries({ queryKey: ['admin-overview'] })
    },
    onError: err => toast.error(err.message || 'Failed', { id: 'pdel' })
  })

  const rows = posts.data?.items || []

  return (
    <>
      <SEO title="Posts management" />
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Posts</h1>
        <p className="text-sm text-neutral-500">
          Moderate and remove platform content
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                className="pl-9"
                value={q}
                onChange={e => {
                  setQ(e.target.value)
                  setPage(1)
                }}
                placeholder="Search post text or author username"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => qc.invalidateQueries({ queryKey: ['admin-posts'] })}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
          {posts.isPending ? (
            <p className="py-8 text-center text-sm text-neutral-500">Loading…</p>
          ) : posts.isError ? (
            <p className="py-8 text-center text-sm text-rose-500">
              {posts.error.message}
            </p>
          ) : (
            <>
              <div className="space-y-3">
                {rows.map(p => (
                  <div
                    key={p.id}
                    className="flex items-start gap-3 rounded-xl border border-neutral-200 p-3 dark:border-neutral-800"
                  >
                    <UserAvatar user={p.author} className="h-10 w-10" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">
                        {p.author?.name}{' '}
                        <span className="font-normal text-neutral-500">
                          @{p.author?.username}
                        </span>
                      </p>
                      <p className="mt-1 line-clamp-3 text-sm">{p.text || '—'}</p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {p.likesCount} likes · {p.commentsCount} comments ·{' '}
                        {p.createdAt
                          ? new Date(p.createdAt).toLocaleString()
                          : ''}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-rose-600"
                      onClick={() => setConfirm(p)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {rows.length === 0 && (
                  <p className="py-10 text-center text-neutral-500">
                    No posts found.
                  </p>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-neutral-500">
                  {posts.data?.total ?? 0} posts · page {page} of{' '}
                  {Math.max(1, posts.data?.pages || 1)}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= (posts.data?.pages || 1)}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {confirm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          onMouseDown={e => {
            if (e.target === e.currentTarget) setConfirm(null)
          }}
        >
          <div
            role="dialog"
            className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950"
          >
            <h2 className="text-lg font-extrabold">Delete this post?</h2>
            <p className="mt-2 line-clamp-3 text-sm text-neutral-600">
              {confirm.text || '(media only)'}
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirm(null)}>
                Cancel
              </Button>
              <Button
                className="bg-rose-600 hover:bg-rose-700"
                disabled={del.isPending}
                onClick={() => del.mutate(confirm.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
