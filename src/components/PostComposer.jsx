import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Send, ImagePlus, Video, X } from 'lucide-react'
import { api } from '@/lib/api'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { UserAvatar } from '@/components/ui/avatar'
export default function PostComposer({ onPosted, autoFocus = false }) {
  const user = useSelector(s => s.auth.user)
  const qc = useQueryClient()
  const [text, setText] = useState('')
  const [image, setImage] = useState('')
  const [videoPublicId, setVideoPublicId] = useState('')
  const [videoPreview, setVideoPreview] = useState('')
  const [uploading, setUploading] = useState(false)
  const mutation = useMutation({
    mutationFn: () =>
      api.createPost({
        text: text.trim(),
        ...(image.trim() ? { image: image.trim() } : {}),
        ...(videoPublicId ? { videoPublicId } : {})
      }),
    onSuccess: async () => {
      setText('')
      setImage('')
      setVideoPublicId('')
      setVideoPreview('')
      await qc.invalidateQueries({ queryKey: ['feed'] })
      await qc.invalidateQueries({ queryKey: ['profile-posts'] })
      onPosted?.()
    }
  })
  const uploadVideo = async file => {
    if (!file) return
    if (!file.type.startsWith('video/')) {
      window.alert('Please choose a video file.')
      return
    }
    setVideoPreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      const signed = await api.videoUploadSignature()
      if (file.size > signed.maxFileMB * 1024 * 1024)
        throw new Error(`Video must be smaller than ${signed.maxFileMB} MB.`)
      const body = new FormData()
      Object.entries(signed.fields).forEach(([k, v]) =>
        body.append(k, String(v))
      )
      body.append('file', file)
      const response = await fetch(signed.uploadUrl, { method: 'POST', body })
      const result = await response.json()
      if (!response.ok || !result.public_id)
        throw new Error(result.error?.message || 'Video upload failed')
      setVideoPublicId(result.public_id)
      setImage('')
    } catch (error) {
      setVideoPreview('')
      window.alert(error.message || 'Video upload failed')
    } finally {
      setUploading(false)
    }
  }
  if (!user) return null
  return (
    <Card className="mb-4 p-4">
      <div className="flex gap-3">
        <UserAvatar user={user} className="h-11 w-11" />
        <div className="flex-1">
          <Textarea
            autoFocus={autoFocus}
            value={text}
            maxLength={500}
            onChange={e => setText(e.target.value)}
            placeholder={`What's on your mind, ${user.name.split(' ')[0]}?`}
          />
          <div className="mt-3 flex items-center gap-2">
            <ImagePlus className="h-4 w-4 text-brand-600" />
            <Input
              value={image}
              onChange={e => setImage(e.target.value)}
              placeholder="Image URL (optional)"
              aria-label="Image URL"
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-neutral-300 dark:border-neutral-600 px-3 py-2 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800">
              <Video className="h-4 w-4 text-brand-600" />
              Add video
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
                className="hidden"
                disabled={uploading || Boolean(image.trim())}
                onChange={e => uploadVideo(e.target.files?.[0])}
              />
            </label>
            {uploading && (
              <span className="text-xs text-brand-600">Uploading video…</span>
            )}
            {videoPublicId && (
              <span className="text-xs text-emerald-600">Video uploaded ✓</span>
            )}
          </div>
          {videoPreview && (
            <div className="relative mt-3">
              <video
                src={videoPreview}
                controls
                className="max-h-64 w-full rounded-xl bg-black"
              />
              <button
                type="button"
                className="absolute right-2 top-2 rounded-full bg-black/70 p-1 text-white"
                onClick={() => {
                  setVideoPublicId('')
                  setVideoPreview('')
                }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          {image && (
            <img
              src={image}
              alt="Post preview"
              className="mt-3 max-h-64 rounded-xl object-cover"
              onError={e => {
                e.currentTarget.style.display = 'none'
              }}
            />
          )}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-neutral-500">{text.length}/500</span>
            <Button
              onClick={() => mutation.mutate()}
              disabled={
                mutation.isPending ||
                uploading ||
                (!text.trim() && !image.trim() && !videoPublicId)
              }
            >
              <Send className="h-4 w-4" />
              {uploading
                ? 'Uploading…'
                : mutation.isPending
                  ? 'Posting…'
                  : 'Post'}
            </Button>
          </div>
          {mutation.isError && (
            <p className="mt-2 text-sm text-red-500">
              {mutation.error.message}
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}
