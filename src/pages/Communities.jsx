import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'motion/react'
import { Users } from 'lucide-react'
import SEO from '@/components/SEO'
import PageHeader from '@/components/PageHeader'
import { api } from '@/lib/api'
import { compact } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
export default function Communities() {
  const qc = useQueryClient()
  const q = useQuery({
    queryKey: ['communities'],
    queryFn: () => api.communities()
  })
  const join = useMutation({
    mutationFn: ({ id, joined }) => api.joinCommunity(id, joined),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['communities'] })
  })
  return (
    <>
      <SEO
        title="Communities"
        description="Find and join communities you care about."
      />
      <PageHeader
        title="Communities"
        subtitle="Communities available on Vibora"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {q.data?.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Card className="overflow-hidden">
              {c.cover && (
                <img
                  src={c.cover}
                  alt=""
                  loading="lazy"
                  className="h-32 w-full object-cover"
                />
              )}
              <CardContent className="pt-4">
                <h3 className="font-bold">{c.name}</h3>
                <p className="mt-1 flex items-center gap-1 text-xs text-neutral-500">
                  <Users className="h-3.5 w-3.5" />
                  {compact(c.membersCount || 0)} members
                </p>
                <p className="mt-2 text-sm">{c.about}</p>
                <Button
                  className="mt-4 w-full"
                  disabled={join.isPending}
                  variant={c.joined ? 'outline' : 'default'}
                  onClick={() => join.mutate({ id: c.id, joined: c.joined })}
                >
                  {c.joined ? 'Leave community' : 'Join community'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      {q.isPending && (
        <p className="py-8 text-center text-neutral-500">
          Loading communities…
        </p>
      )}
      {q.data?.length === 0 && (
        <p className="py-8 text-center text-neutral-500">
          No communities have been created yet.
        </p>
      )}
      {(q.isError || join.isError) && (
        <p className="py-4 text-sm text-red-500">
          {q.error?.message || join.error?.message}
        </p>
      )}
    </>
  )
}
