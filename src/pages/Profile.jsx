import { useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { updateProfile } from '@/store/authSlice'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MapPin, Link2, Camera, Pencil, X, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import SEO from '@/components/SEO'
import PostCard from '@/components/PostCard'
import { api, normalizePost } from '@/lib/api'
import { compact, cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { UserAvatar } from '@/components/ui/avatar'
import { FeedSkeleton } from '@/components/loading/PageLoader'
const TABS = ['Posts', 'Media']
export default function Profile() {
  const { username } = useParams()
  const current = useSelector(s => s.auth.user)
  const dispatch = useDispatch()
  const qc = useQueryClient()
  const [tab, setTab] = useState('Posts')
  const [editOpen, setEditOpen] = useState(false)
  const [listType, setListType] = useState('')
  const [uploading, setUploading] = useState('')
  const coverInput = useRef(null)
  const avatarInput = useRef(null)
  const [form, setForm] = useState({
    name: '',
    username: '',
    website: '',
    location: '',
    bio: '',
    passion: '',
    relationshipStatus: 'Single'
  })
  const target = username || current?.username
  const isMe = current?.username === target
  const profile = useQuery({
    queryKey: ['profile', target],
    queryFn: () => api.profile(target),
    enabled: Boolean(target)
  })
  const posts = useQuery({
    queryKey: ['profile-posts', target],
    queryFn: () =>
      api.profilePosts(target).then(rows => rows.map(normalizePost)),
    enabled: Boolean(target)
  })
  const follow = useMutation({
    mutationFn: () => api.follow(target, Boolean(profile.data?.isFollowing)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile', target] })
  })
  const saveProfile = useMutation({
    mutationFn: () =>
      api.updateProfile({
        name: form.name.trim(),
        username: form.username.trim().toLowerCase(),
        website: form.website.trim() || null,
        location: form.location.trim() || null,
        bio: form.bio.trim() || null,
        passion: form.passion.trim() || null,
        relationshipStatus: form.relationshipStatus
      }),
    onMutate: () => toast.loading('Saving profile…', { id: 'profile' }),
    onSuccess: async data => {
      dispatch(updateProfile(data))
      setEditOpen(false)
      await qc.invalidateQueries({ queryKey: ['profile'] })
      await qc.invalidateQueries({ queryKey: ['session'] })
      toast.success('Profile updated', { id: 'profile' })
    },
    onError: err => {
      toast.error(err.message || 'Could not update profile', { id: 'profile' })
    }
  })
  const people = useQuery({
    queryKey: ['profile-people', target, listType],
    queryFn: () =>
      listType === 'followers' ? api.followers(target) : api.following(target),
    enabled: Boolean(listType)
  })
  const uploadImage = async (file, kind) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.')
      return
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error('Image must be 8 MB or smaller.')
      return
    }
    setUploading(kind)
    try {
      const signed = await api.imageUploadSignature()
      const body = new FormData()
      Object.entries(signed.fields).forEach(([key, value]) =>
        body.append(key, String(value))
      )
      body.append('file', file)
      const response = await fetch(signed.uploadUrl, { method: 'POST', body })
      const result = await response.json()
      if (!response.ok || !result.secure_url)
        throw new Error(result.error?.message || 'Image upload failed')
      const updated = await api.updateProfile({
        [kind === 'cover' ? 'cover' : 'avatar']: result.secure_url
      })
      dispatch(updateProfile(updated))
      await qc.invalidateQueries()
    } catch (error) {
      toast.error(error.message || 'Could not upload image')
    } finally {
      setUploading('')
    }
  }
  if (!target) return <Navigate to="/login" replace />
  if (profile.isPending)
    return (
      <div className="space-y-4" role="status" aria-label="Loading profile">
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <div className="h-36 animate-pulse bg-neutral-200 dark:bg-neutral-800 sm:h-48" />
          <div className="space-y-3 p-4">
            <div className="-mt-10 h-20 w-20 animate-pulse rounded-full border-4 border-white bg-neutral-200 dark:border-neutral-900 dark:bg-neutral-800" />
            <div className="h-4 w-40 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-3 w-28 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-3 w-full max-w-md animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
          </div>
        </div>
        <FeedSkeleton count={2} />
      </div>
    )
  if (profile.isError)
    return (
      <p className="py-10 text-center text-neutral-500">
        {profile.error.message}
      </p>
    )
  const user = profile.data
  const mine = posts.data || []
  const list = tab === 'Posts' ? mine : mine.filter(p => p.image || p.video)
  return (
    <>
      <SEO
        title={user.name}
        description={user.bio || `${user.name}'s profile`}
      />
      <Card className="mb-4 overflow-hidden">
        <div className="relative h-36 bg-gradient-to-br from-violet-600 to-pink-500 sm:h-72">
          {user.cover && (
            <img
              src={user.cover}
              alt="Profile cover"
              className="h-full w-full object-cover"
            />
          )}
          {isMe && (
            <>
              <input
                ref={coverInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => uploadImage(e.target.files?.[0], 'cover')}
              />
              <Button
                size="sm"
                variant="secondary"
                className="absolute bottom-3 right-3 shadow-lg"
                disabled={uploading === 'cover'}
                onClick={() => coverInput.current?.click()}
              >
                <Camera className="h-4 w-4" />
                {uploading === 'cover' ? 'Uploading…' : 'Change cover'}
              </Button>
            </>
          )}
        </div>
        <div className="px-4 pb-4">
          <div className="-mt-12 flex items-end justify-between">
            <div className="relative">
              <UserAvatar
                user={user}
                className="h-24 w-24 ring-4 ring-white dark:ring-neutral-900"
              />
              {isMe && (
                <>
                  <input
                    ref={avatarInput}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => uploadImage(e.target.files?.[0], 'avatar')}
                  />
                  <button
                    type="button"
                    title="Change profile photo"
                    onClick={() => avatarInput.current?.click()}
                    disabled={uploading === 'avatar'}
                    className="absolute bottom-0 right-0 rounded-full bg-brand-600 p-2 text-white shadow-lg"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
            {isMe ? (
              <Button
                variant="outline"
                onClick={() => {
                  setForm({
                    name: user.name || '',
                    username: user.username || '',
                    website: user.website || '',
                    location: user.location || '',
                    bio: user.bio || '',
                    passion: user.passion || '',
                    relationshipStatus: user.relationshipStatus || 'Single'
                  })
                  setEditOpen(true)
                }}
              >
                <Pencil className="h-4 w-4" /> Edit profile
              </Button>
            ) : (
              <Button
                variant={user.isFollowing ? 'outline' : 'default'}
                disabled={follow.isPending}
                onClick={() => follow.mutate()}
              >
                {user.isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}
          </div>
          <h1 className="mt-3 text-xl font-extrabold">{user.name}</h1>
          <p className="text-sm text-neutral-500">@{user.username}</p>
          {user.bio && <p className="mt-3 text-sm">{user.bio}</p>}
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-neutral-600 dark:text-neutral-300">
            {user.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {user.location}
              </span>
            )}
            {user.website && (
              <a
                href={
                  user.website.startsWith('http')
                    ? user.website
                    : `https://${user.website}`
                }
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1"
              >
                <Link2 className="h-4 w-4" />
                {user.website}
              </a>
            )}
          </div>
          <div className="mt-4 flex gap-6 text-sm">
            <span>
              <b>{user.postsCount ?? mine.length}</b> posts
            </span>
            <button
              type="button"
              onClick={() => setListType('followers')}
              className="hover:text-brand-600"
            >
              <b>{compact(user.followersCount || 0)}</b> followers
            </button>
            <button
              type="button"
              onClick={() => setListType('following')}
              className="hover:text-brand-600"
            >
              <b>{compact(user.followingCount || 0)}</b> following
            </button>
          </div>
        </div>
        <div className="flex border-t border-neutral-200 dark:border-neutral-800">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 cursor-pointer py-3 text-sm font-semibold',
                tab === t
                  ? 'border-b-2 border-brand-600 text-brand-600'
                  : 'text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </Card>
      {posts.isPending ? (
        <FeedSkeleton count={2} />
      ) : (
        list.map(p => <PostCard key={p.id} post={p} />)
      )}
      {!posts.isPending && list.length === 0 && (
        <p className="py-10 text-center text-neutral-500">
          Nothing to show yet.
        </p>
      )}
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
            aria-labelledby="edit-profile-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-neutral-200 bg-white p-5 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 id="edit-profile-title" className="text-lg font-extrabold">
                Edit profile
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <form
              className="space-y-3"
              onSubmit={e => {
                e.preventDefault()
                saveProfile.mutate()
              }}
            >
              <label className="block text-sm font-medium">
                Name
                <Input
                  required
                  minLength={2}
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </label>
              <label className="block text-sm font-medium">
                Username
                <Input
                  required
                  minLength={3}
                  maxLength={20}
                  value={form.username}
                  onChange={e =>
                    setForm({
                      ...form,
                      username: e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9_]/g, '')
                    })
                  }
                />
              </label>
              <label className="block text-sm font-medium">
                Website URL
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={form.website}
                  onChange={e => setForm({ ...form, website: e.target.value })}
                />
              </label>
              <label className="block text-sm font-medium">
                Location
                <Input
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                />
              </label>
              <label className="block text-sm font-medium">
                Bio
                <Textarea
                  maxLength={160}
                  value={form.bio}
                  onChange={e => setForm({ ...form, bio: e.target.value })}
                />
              </label>
              <label className="block text-sm font-medium">
                Passion / Interests
                <Input
                  value={form.passion}
                  onChange={e => setForm({ ...form, passion: e.target.value })}
                />
              </label>
              <label className="block text-sm font-medium">
                Relationship status
                <select
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-transparent px-3 py-2 dark:border-neutral-700"
                  value={form.relationshipStatus}
                  onChange={e =>
                    setForm({ ...form, relationshipStatus: e.target.value })
                  }
                >
                  <option>Single</option>
                  <option>Married</option>
                  <option>In a relationship</option>
                  <option>Prefer not to say</option>
                </select>
              </label>
              {saveProfile.isError && (
                <p className="text-sm text-red-500">
                  {saveProfile.error.message}
                </p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saveProfile.isPending}>
                  {saveProfile.isPending ? 'Saving…' : 'Save changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {listType && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          onMouseDown={e => {
            if (e.target === e.currentTarget) setListType('')
          }}
        >
          <div className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl dark:bg-neutral-950">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-extrabold capitalize">{listType}</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setListType('')}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            {people.isPending ? (
              <p className="py-8 text-center text-sm text-neutral-500">
                Loading accounts…
              </p>
            ) : people.isError ? (
              <p className="text-sm text-red-500">{people.error.message}</p>
            ) : people.data?.length ? (
              people.data.map(person => (
                <Link
                  key={person.id}
                  to={`/profile/${person.username}`}
                  onClick={() => setListType('')}
                  className="flex items-center gap-3 rounded-xl p-3 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <UserAvatar user={person} className="h-11 w-11" />
                  <span>
                    <span className="block text-sm font-bold">
                      {person.name}
                    </span>
                    <span className="text-xs text-neutral-500">
                      @{person.username}
                    </span>
                  </span>
                </Link>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-neutral-500">
                No accounts to show.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
