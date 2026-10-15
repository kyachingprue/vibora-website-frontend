import { useQuery } from '@tanstack/react-query'
import {
  Users,
  UserCheck,
  UserX,
  FileText,
  MessageSquare,
  Heart,
  Wifi,
  ShieldAlert
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { api } from '@/lib/api'
import SEO from '@/components/SEO'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { UserAvatar } from '@/components/ui/avatar'
import { Link } from 'react-router'

function Metric({ title, value, icon: Icon, hint }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-center gap-4 p-5">
        <span className="rounded-2xl bg-violet-50 p-3 text-violet-600 dark:bg-violet-600/15">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm text-neutral-500">{title}</p>
          <p className="text-2xl font-extrabold tabular-nums">
            {Number(value || 0).toLocaleString()}
          </p>
          {hint && <p className="text-xs text-neutral-400">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminOverview() {
  const overview = useQuery({
    queryKey: ['admin-overview'],
    queryFn: api.adminOverview,
    refetchInterval: 30_000,
    retry: false
  })

  const data = overview.data?.totals || {}
  const regs = overview.data?.registrations || []
  const posts = overview.data?.postTrends || []
  const chartData = regs.map((r, i) => ({
    date: r.date.slice(5),
    users: r.count,
    posts: posts[i]?.count ?? 0
  }))

  return (
    <>
      <SEO title="Admin Overview" description="Platform overview" />
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Dashboard</h1>
        <p className="text-sm text-neutral-500">
          Live platform metrics from the database
        </p>
      </div>

      {overview.isError && (
        <Card className="mb-4 border-rose-300 p-4 text-sm text-rose-600">
          <ShieldAlert className="mr-2 inline h-4 w-4" />
          {overview.error.message}
        </Card>
      )}

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric title="Total users" value={data.users} icon={Users} />
        <Metric title="Active accounts" value={data.activeUsers} icon={UserCheck} />
        <Metric title="Deactivated" value={data.deactivatedUsers} icon={UserX} />
        <Metric
          title="Online now"
          value={data.onlineUsers}
          icon={Wifi}
          hint="Socket presence"
        />
        <Metric title="Posts" value={data.posts} icon={FileText} />
        <Metric title="Comments" value={data.comments} icon={MessageSquare} />
        <Metric title="Likes" value={data.likes} icon={Heart} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Registrations & posts (30 days)</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {overview.isPending ? (
              <p className="text-sm text-neutral-500">Loading chart…</p>
            ) : chartData.length === 0 ? (
              <p className="text-sm text-neutral-500">No data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-40" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="users"
                    name="New users"
                    stroke="#7c3aed"
                    fill="#7c3aed33"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="posts"
                    name="Posts"
                    stroke="#ec4899"
                    fill="#ec489933"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent signups</CardTitle>
            <Link
              to="/admin/users"
              className="text-sm font-medium text-violet-600 hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {(overview.data?.recentUsers || []).map(u => (
                <li key={u.id} className="flex items-center gap-3 py-2.5">
                  <UserAvatar user={u} className="h-9 w-9" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{u.name}</p>
                    <p className="truncate text-xs text-neutral-500">
                      @{u.username} · {u.email}
                    </p>
                  </div>
                  <span
                    className={
                      u.isActive
                        ? 'rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : 'rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                    }
                  >
                    {u.isActive ? 'Active' : 'Off'}
                  </span>
                </li>
              ))}
              {!overview.data?.recentUsers?.length && (
                <p className="py-6 text-center text-sm text-neutral-500">
                  No users yet.
                </p>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
