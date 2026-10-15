import { useState } from 'react'
import { Link } from 'react-router'
import { useSelector } from 'react-redux'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'motion/react'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import toast from 'react-hot-toast'
import {
  Bookmark,
  BookmarkCheck,
  MessageCircle,
  Share2,
  Trash2,
  MoreHorizontal,
  Pencil,
  X,
  Send,
  Reply,
  AlertTriangle
} from 'lucide-react'
import { api, normalizeComment } from '@/lib/api'
import { timeAgo, compact, cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/ui/avatar'
function renderText(text = '') {
  return text.split(/(#\w+)/g).map((part, i) =>
    part.startsWith('#') ? (
      <Link
        key={i}
        to={`/explore?q=${part.slice(1)}`}
        className="font-semibold text-brand-600 hover:underline"
      >
        {part}
      </Link>
    ) : (
      part
    )
  )
}
export default function PostCard({ post, defaultOpen = false }) {
  const me = useSelector(s => s.auth.user)
  const qc = useQueryClient()
  const [open, setOpen] = useState(defaultOpen)
  const [comment, setComment] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [copied, setCopied] = useState(false)
  const [likedNow, setLikedNow] = useState(Boolean(post.liked))
  const [likesNow, setLikesNow] = useState(Number(post.likes || 0))
  const [bookmarkedNow, setBookmarkedNow] = useState(Boolean(post.bookmarked))
  const [menuOpen, setMenuOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editText, setEditText] = useState(post.text || '')
  const commentsQuery = useQuery({
    queryKey: ['comments', post.id],
    queryFn: () =>
      api.comments(post.id).then(rows => rows.map(normalizeComment)),
    enabled: open,
    staleTime: 10000
  })
  const refresh = async () => {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ['feed'] }),
      qc.invalidateQueries({ queryKey: ['post', post.id] }),
      qc.invalidateQueries({ queryKey: ['comments', post.id] }),
      qc.invalidateQueries({ queryKey: ['profile-posts'] })
    ])
  }
  const like = useMutation({
    mutationFn: nextLiked => api.likePost({ ...post, liked: !nextLiked }),
    onSuccess: refresh
  })
  const bookmark = useMutation({
    mutationFn: nextBookmarked =>
      api.bookmarkPost({ ...post, bookmarked: !nextBookmarked }),
    onSuccess: refresh
  })
  const toggleLike = () => {
    if (like.isPending) return
    const next = !likedNow
    setLikedNow(next)
    setLikesNow(n => Math.max(0, n + (next ? 1 : -1)))
    like.mutate(next, {
      onError: () => {
        setLikedNow(!next)
        setLikesNow(n => Math.max(0, n + (next ? -1 : 1)))
      }
    })
  }
  const toggleBookmark = () => {
    if (bookmark.isPending) return
    const next = !bookmarkedNow
    setBookmarkedNow(next)
    bookmark.mutate(next, { onError: () => setBookmarkedNow(!next) })
  }
  const edit = useMutation({
    mutationFn: () => api.updatePost(post.id, { text: editText.trim() }),
    onSuccess: async () => {
      setEditOpen(false)
      await refresh()
    }
  })
  const remove = useMutation({
    mutationFn: () => api.deletePost(post.id),
    onSuccess: refresh
  })
  const add = useMutation({
    mutationFn: ({ text, parentId }) => api.addComment(post.id, text, parentId),
    onSuccess: async () => {
      setComment('')
      setReplyText('')
      setReplyTo(null)
      await qc.invalidateQueries({ queryKey: ['comments', post.id] })
      await refresh()
    }
  })
  const share = async () => {
    const url = `${window.location.origin}/post/${post.id}`
    try {
      if (navigator.share) await navigator.share({ title: 'Vibora', url })
      else await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
      await api.sharePost(post.id)
      await refresh()
    } catch {
      /* user cancelled or clipboard unsupported */
    }
  }
  const comments = commentsQuery.data || []
  const top = comments.filter(c => !c.parentId)
  const replies = comments.filter(c => c.parentId)
  const submit = e => {
    e.preventDefault()
    if (comment.trim()) add.mutate({ text: comment.trim() })
  }
  const submitReply = e => {
    e.preventDefault()
    if (replyText.trim() && replyTo)
      add.mutate({ text: replyText.trim(), parentId: replyTo })
  }
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35 }}
    >
      <Card className="mb-4 overflow-hidden">
        <div className="flex items-center gap-3 p-4">
          <Link to={`/profile/${post.author?.username}`}>
            <UserAvatar user={post.author} className="h-11 w-11" />
          </Link>
          <div className="min-w-0 flex-1">
            <Link
              to={`/profile/${post.author?.username}`}
              className="block truncate font-bold text-black hover:underline dark:text-white"
            >
              {post.author?.name || 'User'}
            </Link>
            <p className="text-xs text-neutral-500">
              @{post.author?.username} · {timeAgo(post.createdAt)}
            </p>
          </div>
          {me?.id === post.author?.id && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Post options"
                onClick={() => setMenuOpen(v => !v)}
              >
                <MoreHorizontal className="h-5 w-5" />
              </Button>
              {menuOpen && (
                <div className="absolute right-0 top-full z-20 w-40 rounded-xl border border-neutral-200 bg-white p-1 shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
                  <button
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    onClick={() => {
                      setEditText(post.text || '')
                      setEditOpen(true)
                      setMenuOpen(false)
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                    Edit post
                  </button>

                  <button
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={remove.isPending}
                    onClick={() => {
                      setMenuOpen(false)

                      toast.custom(
                        t => (
                          <div
                            className={`w-[360px] max-w-[calc(100vw-32px)] rounded-2xl border border-red-200 bg-white p-5 shadow-2xl dark:border-red-900 dark:bg-gray-900 ${
                              t.visible
                                ? 'animate-in fade-in zoom-in-95'
                                : 'opacity-0'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
                                <AlertTriangle className="h-6 w-6" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                  Delete this post?
                                </h3>

                                <p className="mt-1 text-sm leading-5 text-gray-500 dark:text-gray-400">
                                  This action cannot be undone. Are you sure you
                                  want to permanently delete this post?
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => toast.dismiss(t.id)}
                                className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
                                aria-label="Close confirmation"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="mt-5 flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => toast.dismiss(t.id)}
                                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                              >
                                Cancel
                              </button>

                              <button
                                type="button"
                                disabled={remove.isPending}
                                onClick={() => {
                                  toast.dismiss(t.id)
                                  remove.mutate()
                                }}
                                className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete post
                              </button>
                            </div>
                          </div>
                        ),
                        {
                          duration: Infinity,
                          position: 'top-center'
                        }
                      )
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete post
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        {post.text && (
          <p className="px-4 pb-3 text-[15px] leading-relaxed text-black dark:text-white">
            {renderText(post.text)}
          </p>
        )}
        {post.image && (
          <Link to={`/post/${post.id}`}>
            <img
              src={post.image}
              alt="Post attachment"
              loading="lazy"
              className="max-h-[520px] w-full object-cover"
            />
          </Link>
        )}
        {post.video?.url && (
          <video
            src={post.video.url}
            poster={post.video.thumbnail}
            controls
            playsInline
            className="max-h-[520px] w-full bg-black"
          />
        )}
        <div className="flex items-center gap-1 px-2 py-2 sm:px-3">
          <button
            onClick={toggleLike}
            disabled={like.isPending}
            aria-label="Like"
            className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-black hover:bg-neutral-100 dark:text-white dark:hover:bg-neutral-800"
          >
            <motion.span
              key={String(likedNow)}
              initial={{ scale: 0.4 }}
              animate={{ scale: 1 }}
            >
              <>
                {likedNow ? (
                  <FaHeart className="h-5 w-5 text-pink-500" />
                ) : (
                  <FaRegHeart className="h-5 w-5" />
                )}
              </>
            </motion.span>
            {compact(likesNow)}
          </button>
          <button
            onClick={() => setOpen(o => !o)}
            aria-label="Comments"
            className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-black hover:bg-neutral-100 dark:text-white dark:hover:bg-neutral-800"
          >
            <MessageCircle className="h-5 w-5" />
            {post.commentsCount ?? post.comments?.length ?? 0}
          </button>
          <button
            onClick={share}
            aria-label="Share"
            className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-black hover:bg-neutral-100 dark:text-white dark:hover:bg-neutral-800"
          >
            <Share2 className="h-5 w-5" />
            {copied ? 'Copied!' : compact(post.shares)}
          </button>
          <button
            onClick={toggleBookmark}
            disabled={bookmark.isPending}
            aria-label="Bookmark"
            className={cn(
              'ml-auto cursor-pointer rounded-full p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800',
              bookmarkedNow ? 'text-brand-600' : 'text-black dark:text-white'
            )}
          >
            {bookmarkedNow ? (
              <BookmarkCheck className="h-5 w-5" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </button>
        </div>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-neutral-200 dark:border-neutral-800"
            >
              <div className="flex flex-col gap-3 p-4">
                {commentsQuery.isPending && (
                  <p className="text-sm text-neutral-500">Loading comments…</p>
                )}
                {commentsQuery.isError && (
                  <p className="text-sm text-red-500">
                    {commentsQuery.error.message}
                  </p>
                )}
                {top.map(c => (
                  <div key={c.id} className="flex gap-2.5">
                    <UserAvatar user={c.user} className="h-8 w-8" />
                    <div className="min-w-0 flex-1">
                      <div className="inline-block max-w-full rounded-2xl bg-neutral-100 px-3 py-2 dark:bg-neutral-800">
                        <p className="text-xs font-bold text-black dark:text-white">
                          {c.user?.name || 'User'}
                        </p>
                        <p className="break-words text-sm text-black dark:text-white">
                          {c.text}
                        </p>
                      </div>
                      <div className="mt-1 flex items-center gap-3 pl-2">
                        <span className="text-[11px] text-neutral-500">
                          {timeAgo(c.createdAt)}
                        </span>
                        <button
                          onClick={() => {
                            setReplyTo(c.id)
                            setReplyText('')
                          }}
                          className="flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-brand-600"
                        >
                          <Reply className="h-3 w-3" />
                          Reply
                        </button>
                      </div>
                      {replies
                        .filter(r => r.parentId === c.id)
                        .map(r => (
                          <div key={r.id} className="mt-3 flex gap-2">
                            <UserAvatar user={r.user} className="h-7 w-7" />
                            <div className="min-w-0">
                              <div className="inline-block rounded-2xl bg-neutral-100 px-3 py-2 dark:bg-neutral-800">
                                <p className="text-xs font-bold">
                                  {r.user?.name || 'User'}
                                </p>
                                <p className="break-words text-sm">{r.text}</p>
                              </div>
                              <p className="mt-1 pl-2 text-[11px] text-neutral-500">
                                {timeAgo(r.createdAt)}
                              </p>
                            </div>
                          </div>
                        ))}
                      {replyTo === c.id && (
                        <form
                          onSubmit={submitReply}
                          className="mt-2 flex gap-2"
                        >
                          <Input
                            autoFocus
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            placeholder={`Reply to ${c.user?.name || 'comment'}…`}
                          />
                          <Button
                            type="submit"
                            size="icon"
                            disabled={!replyText.trim() || add.isPending}
                            aria-label="Send reply"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setReplyTo(null)}
                          >
                            Cancel
                          </Button>
                        </form>
                      )}
                    </div>
                  </div>
                ))}
                {!commentsQuery.isPending && top.length === 0 && (
                  <p className="text-sm text-neutral-500">
                    No comments yet. Be the first!
                  </p>
                )}
                <form onSubmit={submit} className="flex gap-2">
                  <Input
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Write a comment…"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    aria-label="Send comment"
                    disabled={!comment.trim() || add.isPending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
                {add.isError && (
                  <p className="text-sm text-red-500">{add.error.message}</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
      {editOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          onMouseDown={e => {
            if (e.target === e.currentTarget) setEditOpen(false)
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl dark:bg-neutral-950"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold">Edit post</h2>
              <button
                onClick={() => setEditOpen(false)}
                aria-label="Close edit post"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={e => {
                e.preventDefault()
                edit.mutate()
              }}
            >
              <textarea
                maxLength={500}
                value={editText}
                onChange={e => setEditText(e.target.value)}
                className="min-h-32 w-full rounded-xl border border-neutral-200 bg-transparent p-3 text-sm outline-none focus:ring-2 focus:ring-brand-500 dark:border-neutral-700"
                placeholder="What's on your mind?"
              />
              <p className="mt-1 text-xs text-neutral-500">
                {editText.length}/500
              </p>
              {edit.isError && (
                <p className="mt-2 text-sm text-red-500">
                  {edit.error.message}
                </p>
              )}
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={edit.isPending}>
                  {edit.isPending ? 'Saving…' : 'Save changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.article>
  )
}
