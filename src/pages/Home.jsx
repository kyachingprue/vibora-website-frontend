import { useQuery } from '@tanstack/react-query'
import SEO from '@/components/SEO'
import StoryBar from '@/components/StoryBar'
import PostCard from '@/components/PostCard'
import { api, normalizePost } from '@/lib/api'
import { FeedSkeleton } from '@/components/loading/PageLoader'
export default function Home() {
  const feed = useQuery({
    queryKey: ['feed'],
    queryFn: () =>
      api.feed({ scope: 'all' }).then(rows => rows.map(normalizePost))
  })
  return (
    <>
      <SEO title="Home" description="Your personalised feed on Vibora." />
      <StoryBar />
      {feed.isPending ? (
        <FeedSkeleton count={3} />
      ) : feed.isError ? (
        <p className="py-10 text-center text-red-500">{feed.error.message}</p>
      ) : (
        feed.data.map(p => <PostCard key={p.id} post={p} />)
      )}
      {feed.data?.length === 0 && (
        <p className="py-10 text-center text-neutral-500">
          No posts yet — be the first to share something.
        </p>
      )}
    </>
  )
}
