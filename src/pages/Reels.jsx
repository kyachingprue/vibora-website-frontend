import { Video } from 'lucide-react'
import SEO from '@/components/SEO'
import PageHeader from '@/components/PageHeader'
import { Card } from '@/components/ui/card'
export default function Reels() {
  return (
    <>
      <SEO title="Reels" description="Short videos from creators you love." />
      <PageHeader
        title="Reels"
        subtitle="Short videos from creators you love"
      />
      <Card className="flex flex-col items-center gap-3 py-16 text-center">
        <Video className="h-10 w-10 text-neutral-400" />
        <h2 className="font-bold">No reels yet</h2>
        <p className="max-w-sm text-sm text-neutral-500">
          The current server API supports video attachments on posts, but it
          does not yet provide a separate reels feed. Video posts will appear in
          the main feed.
        </p>
      </Card>
    </>
  )
}
