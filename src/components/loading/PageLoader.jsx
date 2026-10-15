import { MessageCircle } from 'lucide-react'

function Skeleton({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800 ${className}`}
    />
  )
}

export function FeedSkeleton({ count = 2 }) {
  return (
    <div className="space-y-4" role="status" aria-label="Loading posts">
      <span className="sr-only">Loading posts...</span>

      {Array.from({ length: count }, (_, i) => (
        <article
          key={i}
          className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />

            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-4/5" />
          </div>

          {i === 0 && (
            <Skeleton className="mt-4 aspect-video w-full rounded-xl" />
          )}

          <div className="mt-4 flex gap-5">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-12" />
          </div>
        </article>
      ))}
    </div>
  )
}

export function ContentSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading content">
      <span className="sr-only">Loading content...</span>

      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3 py-2">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />

          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-3/4 max-w-xs" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function PageLoader({ variant = 'screen' }) {
  if (variant === 'page') {
    return (
      <div
        className="mx-auto w-full max-w-2xl space-y-4 px-3 py-5"
        role="status"
        aria-label="Loading page"
      >
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />

          <div className="space-y-2">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>

        <FeedSkeleton count={2} />
      </div>
    )
  }

  return (
    <div
      className="flex min-h-[100vh] flex-col items-center justify-center bg-neutral-50 px-5 dark:bg-neutral-950"
      role="status"
      aria-label="Loading SocialHub"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-md shadow-violet-600/15">
        <MessageCircle size={27} strokeWidth={2.2} />
      </div>

      <p className="mt-4 text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
        Social<span className="text-violet-600">Hub</span>
      </p>

      <div className="mt-5 h-5 w-5 animate-spin rounded-full border-2 border-neutral-200 border-t-violet-600 dark:border-neutral-700 dark:border-t-violet-400" />

      <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
        Getting things ready...
      </p>
    </div>
  )
}
