import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Send, Plus } from 'lucide-react'
import SEO from '@/components/SEO'
import PageHeader from '@/components/PageHeader'
import { timeAgo, cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/ui/avatar'
import { api } from '@/lib/api'
export default function Messages() {
  const me = useSelector(s => s.auth.user)
  const qc = useQueryClient()
  const [activeId, setActiveId] = useState(null)
  const [text, setText] = useState('')
  const [username, setUsername] = useState('')
  const endRef = useRef(null)
  const followers = useQuery({ queryKey: ['message-followers', me?.username], queryFn: () => api.followers(me.username), enabled: Boolean(me?.username), staleTime: 30000 })
  const conversations = useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.conversations()
  })
  const active = (conversations.data || []).find(c => c.id === activeId) || null
  const shown = active || conversations.data?.[0] || null
  const conversationId = activeId || shown?.id
  const messages = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () =>
      api.messages(conversationId).then(rows => rows.slice().reverse()),
    enabled: Boolean(conversationId),
    refetchInterval: 3000
  })
  const start = useMutation({
    mutationFn: targetUsername => api.startConversation((targetUsername || username).trim()),
    onSuccess: async data => {
      setUsername('')
      await qc.invalidateQueries({ queryKey: ['conversations'] })
      setActiveId(data.id)
    }
  })
  const send = useMutation({
    mutationFn: () => api.sendMessage(conversationId, text.trim()),
    onSuccess: async () => {
      setText('')
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['messages', conversationId] }),
        qc.invalidateQueries({ queryKey: ['conversations'] })
      ])
    }
  })
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.data?.length, conversationId])
  const last = c => c?.lastMessage?.text || 'Start a conversation'
  return (
    <>
      <SEO title="Messages" description="Chat with your friends." />
      <PageHeader title="Messages" />
      <Card className="grid h-[calc(100vh-14rem)] min-h-[420px] grid-cols-1 overflow-hidden md:h-[calc(100vh-10rem)] md:grid-cols-[280px_1fr]">
        <div
          className={cn(
            'flex-col overflow-y-auto border-neutral-200 md:flex md:border-r dark:border-neutral-800',
            active ? 'hidden' : 'flex'
          )}
        >
          <form
            onSubmit={e => {
              e.preventDefault()
              if (username.trim()) start.mutate()
            }}
            className="flex gap-1 border-b border-neutral-200 p-3 dark:border-neutral-800"
          >
            <Input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Username to message"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!username.trim() || start.isPending}
              aria-label="Start conversation"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </form>
          {conversations.data?.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={cn(
                'flex cursor-pointer items-center gap-3 px-4 py-3 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800',
                shown?.id === c.id && 'md:bg-neutral-100 md:dark:bg-neutral-800'
              )}
            >
              <UserAvatar user={c.user} className="h-12 w-12" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">
                  {c.user?.name || 'Conversation'}
                </p>
                <p className="truncate text-sm text-neutral-500">{last(c)}</p>
              </div>
            </button>
          ))}
          <div className="border-t border-neutral-200 p-3 dark:border-neutral-800"><p className="mb-2 text-xs font-bold uppercase tracking-wide text-neutral-500">Your followers</p>{followers.isPending ? <p className="text-xs text-neutral-500">Loading followers…</p> : followers.data?.length ? <div className="space-y-1">{followers.data.map(person => <button key={person.id} onClick={() => { setUsername(person.username); start.mutate(person.username) }} className="flex w-full items-center gap-2 rounded-xl p-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800"><span className="relative"><UserAvatar user={person} className="h-9 w-9"/><span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-neutral-900"/></span><span className="min-w-0"><span className="block truncate text-sm font-semibold">{person.name}</span><span className="block truncate text-xs text-neutral-500">@{person.username}</span></span></button>)}</div> : <p className="text-xs text-neutral-500">No followers yet.</p>}</div>
          {conversations.data?.length === 0 && <p className="p-4 text-sm text-neutral-500">No conversations yet. Choose a follower above or enter a username to start one.</p>}
          {(conversations.isError || start.isError) && (
            <p className="p-3 text-sm text-red-500">
              {conversations.error?.message || start.error?.message}
            </p>
          )}
        </div>
        <div
          className={cn('min-h-0 flex-col md:flex', active ? 'flex' : 'hidden')}
        >
          <>
            {shown ? (
              <>
                <div className="flex items-center gap-3 border-b border-neutral-200 p-3 dark:border-neutral-800">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    aria-label="Back"
                    onClick={() => setActiveId(null)}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <UserAvatar user={shown.user} className="h-10 w-10" />
                  <div>
                    <p className="text-sm font-bold">
                      {shown.user?.name || 'Conversation'}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Messages refresh automatically
                    </p>
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
                  {messages.data?.map(m => (
                    <div
                      key={m.id}
                      className={cn(
                        'max-w-[78%] rounded-2xl px-4 py-2 text-sm',
                        m.senderId === me?.id
                          ? 'ml-auto bg-brand-600 text-white'
                          : 'bg-neutral-100 text-black dark:bg-neutral-800 dark:text-white'
                      )}
                    >
                      {m.text}
                      <div
                        className={cn(
                          'mt-1 text-[10px]',
                          m.senderId === me?.id
                            ? 'text-white/70'
                            : 'text-neutral-500'
                        )}
                      >
                        {timeAgo(new Date(m.createdAt).getTime())}
                      </div>
                    </div>
                  ))}
                  {messages.isPending && (
                    <p className="text-sm text-neutral-500">
                      Loading messages…
                    </p>
                  )}
                  <div ref={endRef} />
                </div>
                <form
                  onSubmit={e => {
                    e.preventDefault()
                    if (text.trim()) send.mutate()
                  }}
                  className="flex gap-2 border-t border-neutral-200 p-3 dark:border-neutral-800"
                >
                  <Input
                    value={text}
                    onChange={e => setText(e.target.value)}
                    placeholder="Message…"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    aria-label="Send"
                    disabled={!text.trim() || send.isPending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
                {(messages.isError || send.isError) && (
                  <p className="px-3 pb-2 text-sm text-red-500">
                    {messages.error?.message || send.error?.message}
                  </p>
                )}
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center p-6 text-center text-neutral-500">
                Select a conversation or start one using a username.
              </div>
            )}
          </>
        </div>
      </Card>
    </>
  )
}
