import { Link } from 'react-router'
import { useSelector } from 'react-redux'
import { Plus } from 'lucide-react'
import { UserAvatar } from '@/components/ui/avatar'
export default function StoryBar() {
  const me = useSelector(s => s.auth.user)
  return (
    <div className="mb-4">
      <Link
        to="/create"
        className="flex w-fit items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <span className="relative">
          <UserAvatar user={me} className="h-12 w-12" />
          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white">
            <Plus className="h-3 w-3" />
          </span>
        </span>
        <span>
          <span className="block text-sm font-bold">Create a post</span>
          <span className="block text-xs text-neutral-500">
            Share a photo, video or thought
          </span>
        </span>
      </Link>
    </div>
  )
}
