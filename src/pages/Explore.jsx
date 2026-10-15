import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router'
import { Search, Hash } from 'lucide-react'
import SEO from '@/components/SEO'
import PageHeader from '@/components/PageHeader'
import PostCard from '@/components/PostCard'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { FollowRow } from '@/components/layout/RightSidebar'
import { Card, CardContent } from '@/components/ui/card'
import { api, normalizePost } from '@/lib/api'
import { ContentSkeleton, FeedSkeleton } from '@/components/loading/PageLoader'
export default function Explore() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') || ''
  const posts = useQuery({
    queryKey: ['search-posts', q],
    queryFn: () =>
      api.feed({ q, limit: '20' }).then(rows => rows.map(normalizePost)),
    enabled: Boolean(q.trim())
  })
  const people = useQuery({
    queryKey: ['search-users', q],
    queryFn: () => api.searchUsers(q),
    enabled: Boolean(q.trim())
  })
  const trending = useQuery({
    queryKey: ['trending'],
    queryFn: () => api.trending()
  })
  return (
    <>
      <SEO
        title={q ? `Search: ${q}` : 'Explore'}
        description="Discover posts, people and topics."
      />
      <PageHeader
        title="Explore"
        subtitle="Discover posts, people and topics"
      />
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
        <Input
          className="pl-10"
          value={q}
          onChange={e => setParams(e.target.value ? { q: e.target.value } : {})}
          placeholder="Search posts, people, #hashtags"
        />
      </div>
      <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto">
        {trending.data?.map(t => (
          <Link key={t.tag} to={`/explore?q=${t.tag}`}>
            <Badge
              variant="secondary"
              className="gap-1 whitespace-nowrap px-3 py-1.5 text-sm"
            >
              <Hash className="h-3.5 w-3.5" />
              {t.tag}
            </Badge>
          </Link>
        ))}
      </div>
      {q.trim() ? (
        <>
          {people.data?.length > 0 && (
            <Card className="mb-4">
              <CardContent className="flex flex-col gap-4 pt-4">
                {people.data.map(u => (
                  <FollowRow key={u.id} user={u} />
                ))}
              </CardContent>
            </Card>
          )}
          {posts.isPending ? (
            <><ContentSkeleton rows={2} /><div className="mt-4"><FeedSkeleton count={2} /></div></>
          ) : (
            posts.data?.map(p => <PostCard key={p.id} post={p} />)
          )}
          {posts.data?.length === 0 && people.data?.length === 0 && (
            <p className="py-10 text-center text-neutral-500">
              No results for “{q}”.
            </p>
          )}
        </>
      ) : (
        <p className="py-10 text-center text-neutral-500">
          Search posts, people, and hashtags to discover content.
        </p>
      )}
    </>
  )
}
