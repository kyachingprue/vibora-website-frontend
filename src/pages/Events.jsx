import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'motion/react'
import { CalendarDays, MapPin } from 'lucide-react'
import SEO from '@/components/SEO'
import PageHeader from '@/components/PageHeader'
import { api } from '@/lib/api'
import { compact } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
export default function Events() {
  const qc = useQueryClient()
  const q = useQuery({ queryKey: ['events'], queryFn: () => api.events() })
  const attend = useMutation({
    mutationFn: ({ id, going }) => api.attendEvent(id, going),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['events'] })
  })
  return (
    <>
      <SEO title="Events" description="Upcoming events near you and online." />
      <PageHeader title="Events" subtitle="Upcoming events" />
      {q.data?.map((e, i) => (
        <motion.div
          key={e.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
        >
          <Card className="mb-4 flex flex-col overflow-hidden sm:flex-row">
            {e.cover && (
              <img
                src={e.cover}
                alt=""
                loading="lazy"
                className="h-44 w-full object-cover sm:w-56"
              />
            )}
            <div className="flex flex-1 flex-col gap-2 p-4">
              <h3 className="text-lg font-bold">{e.title}</h3>
              {e.description && <p className="text-sm">{e.description}</p>}
              <p className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                <CalendarDays className="h-4 w-4" />
                {new Date(e.startsAt).toLocaleString()}
              </p>
              <p className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
                <MapPin className="h-4 w-4" />
                {e.location}
              </p>
              <div className="mt-auto flex items-center justify-between pt-2">
                <span className="text-xs text-neutral-500">
                  {compact(e.goingCount || 0)} going
                </span>
                <Button
                  size="sm"
                  disabled={attend.isPending}
                  variant={e.going ? 'outline' : 'default'}
                  onClick={() => attend.mutate({ id: e.id, going: e.going })}
                >
                  {e.going ? 'Not going' : 'I’m going'}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
      {q.isPending && (
        <p className="py-8 text-center text-neutral-500">Loading events…</p>
      )}
      {q.data?.length === 0 && (
        <p className="py-8 text-center text-neutral-500">
          No upcoming events yet.
        </p>
      )}
      {(q.isError || attend.isError) && (
        <p className="py-4 text-sm text-red-500">
          {q.error?.message || attend.error?.message}
        </p>
      )}
    </>
  )
}
