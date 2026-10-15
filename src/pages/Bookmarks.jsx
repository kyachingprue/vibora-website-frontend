import { useQuery } from '@tanstack/react-query'
import SEO from '@/components/SEO'
import PageHeader from '@/components/PageHeader'
import PostCard from '@/components/PostCard'
import { api, normalizePost } from '@/lib/api'
export default function Bookmarks() {
  const q = useQuery({
    queryKey: ['bookmarks'],
    queryFn: () => api.bookmarks().then(rows => rows.map(normalizePost))
  })
  return (
    <>
      <SEO title="Bookmarks" description="Posts you saved." />
      <PageHeader title="Bookmarks" subtitle="Your saved posts" />
      {q.isPending ? (
        <p className="py-8 text-center">Loading saved posts…</p>
      ) : q.isError ? (
        <p className="py-8 text-center text-red-500">{q.error.message}</p>
      ) : (
        q.data.map(p => <PostCard key={p.id} post={p} />)
      )}
      {q.data?.length === 0 && (
        <p className="py-8 text-center text-neutral-500">No saved posts yet.</p>
      )}
    </>
  )
}
