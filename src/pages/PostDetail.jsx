import { Link, useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import SEO from '@/components/SEO'
import PostCard from '@/components/PostCard'
import { Button } from '@/components/ui/button'
import { api, normalizePost } from '@/lib/api'
export default function PostDetail() {
  const { id } = useParams()
  const q = useQuery({
    queryKey: ['post', id],
    queryFn: () => api.post(id).then(normalizePost),
    enabled: Boolean(id)
  })
  return (
    <>
      <SEO
        title={q.data ? `${q.data.author.name}'s post` : 'Post'}
        description={q.data?.text}
      />
      <Button asChild variant="ghost" className="mb-3">
        <Link to="/">
          <ArrowLeft className="h-4 w-4" />
          Back to feed
        </Link>
      </Button>
      {q.isPending ? (
        <p className="py-16 text-center text-neutral-500">Loading post…</p>
      ) : q.isError ? (
        <p className="py-16 text-center text-neutral-500">{q.error.message}</p>
      ) : (
        <PostCard post={q.data} defaultOpen />
      )}
    </>
  )
}
