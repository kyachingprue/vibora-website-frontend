import { useState } from 'react'
import { Navigate } from 'react-router'
import { useSelector } from 'react-redux'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Users,
  UserCheck,
  UserX,
  FileText,
  MessageSquare,
  Search,
  ShieldAlert,
  RefreshCw,
  Trash2
} from 'lucide-react'
import { api } from '@/lib/api'
import SEO from '@/components/SEO'
import PageHeader from '@/components/PageHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

function Metric({ title, value, icon: Icon }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <span className="rounded-2xl bg-brand-50 p-3 text-brand-600 dark:bg-brand-600/15">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm text-neutral-500">{title}</p>
          <p className="text-2xl font-extrabold">
            {Number(value || 0).toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
export default function AdminDashboard() {
  const user = useSelector(s => s.auth.user)
  const qc = useQueryClient()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const overview = useQuery({
    queryKey: ['admin-overview'],
    queryFn: api.adminOverview,
    retry: false
  })
  const users = useQuery({
    queryKey: ['admin-users', q, status, page],
    queryFn: () => api.adminUsers({ q, status, page }),
    retry: false
  })
  const statusMutation = useMutation({
    mutationFn: ({ id, active }) => api.adminSetUserStatus(id, active),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      qc.invalidateQueries({ queryKey: ['admin-overview'] })
    }
  })
  const deleteMutation = useMutation({
    mutationFn: api.adminDeleteUser,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      qc.invalidateQueries({ queryKey: ['admin-overview'] })
    }
  })
  if (
    !['admin', 'administrator'].includes(String(user?.role || '').toLowerCase())
  )
    return <Navigate to="/" replace />
  const data = overview.data?.totals || {}
  const rows = users.data?.items || []
  const exportCsv = () => {
    const all = rows
    const csv = [
      ['id', 'name', 'username', 'email', 'role', 'isActive', 'createdAt'],
      ...all.map(u => [
        u.id,
        u.name,
        u.username,
        u.email,
        u.role,
        u.isActive,
        u.createdAt
      ])
    ]
      .map(row =>
        row.map(v => `"${String(v ?? '').replaceAll('"', '""')}"`).join(',')
      )
      .join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(
      new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    )
    a.download = 'vibora-users.csv'
    a.click()
    URL.revokeObjectURL(a.href)
  }
  return (
    <>
      <SEO
        title="Admin dashboard"
        description="Manage platform activity and users."
      />
      <PageHeader
        title="Admin Dashboard"
        subtitle="Live platform overview and account management"
      >
        <Button variant="outline" onClick={exportCsv}>
          <FileText className="mr-2 h-4 w-4" />
          Export current page CSV
        </Button>
      </PageHeader>
      {overview.isError && (
        <Card className="mb-4 border-rose-300 p-4 text-sm text-rose-600">
          <ShieldAlert className="mr-2 inline h-4 w-4" />
          {overview.error.message}. Ensure your account has the admin role.
        </Card>
      )}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric title="Total users" value={data.users} icon={Users} />
        <Metric
          title="Active users"
          value={data.activeUsers}
          icon={UserCheck}
        />
        <Metric
          title="Deactivated users"
          value={data.deactivatedUsers}
          icon={UserX}
        />
        <Metric title="Total posts" value={data.posts} icon={FileText} />
        <Metric title="Comments" value={data.comments} icon={MessageSquare} />
      </div>
      <Card className="mb-5">
        <CardHeader>
          <CardTitle>User management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                className="pl-9"
                value={q}
                onChange={e => {
                  setQ(e.target.value)
                  setPage(1)
                }}
                placeholder="Search name, username, email or ID"
              />
            </div>
            <select
              className="rounded-xl border border-neutral-200 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
              value={status}
              onChange={e => {
                setStatus(e.target.value)
                setPage(1)
              }}
            >
              <option value="all">All accounts</option>
              <option value="active">Active</option>
              <option value="inactive">Deactivated</option>
            </select>
            <Button
              variant="outline"
              onClick={() => {
                qc.invalidateQueries({ queryKey: ['admin-overview'] })
                qc.invalidateQueries({ queryKey: ['admin-users'] })
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
          {users.isPending ? (
            <p className="py-8 text-center text-sm text-neutral-500">
              Loading users…
            </p>
          ) : users.isError ? (
            <p className="py-8 text-center text-sm text-rose-500">
              {users.error.message}
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead>
                    <tr className="border-b text-xs uppercase text-neutral-500">
                      <th className="p-3">User</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Joined</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(u => (
                      <tr
                        key={u.id}
                        className="border-b border-neutral-100 dark:border-neutral-800"
                      >
                        <td className="p-3">
                          <p className="font-semibold">{u.name}</p>
                          <p className="text-xs text-neutral-500">
                            @{u.username}
                          </p>
                          <p className="max-w-32 truncate text-[10px] text-neutral-400">
                            {u.id}
                          </p>
                        </td>
                        <td className="p-3">{u.email}</td>
                        <td className="p-3">{u.role}</td>
                        <td className="p-3">
                          <span
                            className={
                              u.isActive
                                ? 'rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700'
                                : 'rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-700'
                            }
                          >
                            {u.isActive ? 'Active' : 'Deactivated'}
                          </span>
                        </td>
                        <td className="p-3">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={
                                u.id === user.id || statusMutation.isPending
                              }
                              onClick={() =>
                                statusMutation.mutate({
                                  id: u.id,
                                  active: !u.isActive
                                })
                              }
                            >
                              {u.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              aria-label="Delete user"
                              disabled={
                                u.id === user.id || deleteMutation.isPending
                              }
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Permanently delete @${u.username}? This cannot be undone.`
                                  )
                                )
                                  deleteMutation.mutate(u.id)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-neutral-500">
                  {users.data.total} accounts · page {page} of{' '}
                  {Math.max(1, users.data.pages)}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= users.data.pages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Registration activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-neutral-500">
            Daily registration records from the database (latest 90 records
            returned).
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {(overview.data?.registrations || []).slice(-12).map((r, i) => (
              <div
                key={`${r.date}-${i}`}
                className="rounded-xl bg-neutral-50 p-3 dark:bg-neutral-800"
              >
                <p className="text-xs text-neutral-500">{r.date}</p>
                <p className="mt-1 text-xl font-bold">{r.count}</p>
                <div className="mt-2 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-700">
                  <div
                    className="h-1.5 rounded-full bg-brand-600"
                    style={{ width: `${Math.min(100, r.count * 12)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          {!overview.data?.registrations?.length && (
            <p className="text-sm text-neutral-500">
              No registration data available.
            </p>
          )}
        </CardContent>
      </Card>
    </>
  )
}
