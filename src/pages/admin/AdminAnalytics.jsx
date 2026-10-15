import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { api } from '@/lib/api'
import SEO from '@/components/SEO'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const RANGES = [7, 14, 30, 90]
const PIE_COLORS = ['#7c3aed', '#a78bfa', '#ec4899', '#f59e0b']

export default function AdminAnalytics() {
  const [days, setDays] = useState(30)
  const analytics = useQuery({
    queryKey: ['admin-analytics', days],
    queryFn: () => api.adminAnalytics({ days }),
    retry: false
  })

  const regs = analytics.data?.registrations || []
  const posts = analytics.data?.postTrends || []
  const eng = analytics.data?.engagement || {}
  const totals = analytics.data?.totals || {}

  const trendData = regs.map((r, i) => ({
    date: r.date.slice(5),
    users: r.count,
    posts: posts[i]?.count ?? 0
  }))

  const statusPie = [
    { name: 'Active', value: totals.activeUsers || 0 },
    { name: 'Deactivated', value: totals.deactivatedUsers || 0 }
  ]

  const engagementBar = [
    { name: 'Likes', value: eng.likes || 0 },
    { name: 'Comments', value: eng.comments || 0 },
    { name: 'Follows', value: eng.follows || 0 }
  ]

  return (
    <>
      <SEO title="Admin Analytics" />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Analytics</h1>
          <p className="text-sm text-neutral-500">
            Real metrics from the database — last {days} days
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {RANGES.map(d => (
            <Button
              key={d}
              size="sm"
              variant={days === d ? 'default' : 'outline'}
              onClick={() => setDays(d)}
            >
              {d}d
            </Button>
          ))}
        </div>
      </div>

      {analytics.isError && (
        <Card className="mb-4 border-rose-300 p-4 text-sm text-rose-600">
          {analytics.error.message}
        </Card>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ['Users', totals.users],
          ['Active', totals.activeUsers],
          ['Posts', totals.posts],
          ['Online', totals.onlineUsers]
        ].map(([label, val]) => (
          <Card key={label}>
            <CardContent className="p-4">
              <p className="text-xs text-neutral-500">{label}</p>
              <p className="text-xl font-extrabold tabular-nums">
                {Number(val || 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Growth trends</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {analytics.isPending ? (
              <p className="text-sm text-neutral-500">Loading…</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-40" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="users"
                    name="Registrations"
                    stroke="#7c3aed"
                    fill="#7c3aed33"
                  />
                  <Area
                    type="monotone"
                    dataKey="posts"
                    name="Posts"
                    stroke="#ec4899"
                    fill="#ec489933"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account status</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPie}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {statusPie.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Engagement ({days} days)</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={engagementBar}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-40" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#7c3aed" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </>
  )
}
