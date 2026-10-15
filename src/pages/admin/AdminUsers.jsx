import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  Search,
  Trash2,
  UserCheck,
  UserX,
  RefreshCw,
  Wifi
} from 'lucide-react'
import { api } from '@/lib/api'
import { onPresence } from '@/lib/socket'
import SEO from '@/components/SEO'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export default function AdminUsers() {
  const me = useSelector(s => s.auth.user)
  const qc = useQueryClient()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('all')
  const [role, setRole] = useState('all')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const users = useQuery({
    queryKey: ['admin-users', q, status, role, sort, page],
    queryFn: () => api.adminUsers({ q, status, role, sort, page }),
    retry: false
  })

  useEffect(() => {
    return onPresence({
      userStatus: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
      userDeleted: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
      adminUpdate: () => qc.invalidateQueries({ queryKey: ['admin-users'] })
    })
  }, [qc])

  const statusMutation = useMutation({
    mutationFn: ({ id, active }) => api.adminSetUserStatus(id, active),
    onMutate: () => toast.loading('Updating…', { id: 'status' }),
    onSuccess: () => {
      toast.success('Status updated', { id: 'status' })
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      qc.invalidateQueries({ queryKey: ['admin-overview'] })
    },
    onError: err => toast.error(err.message || 'Failed', { id: 'status' })
  })

  const deleteMutation = useMutation({
    mutationFn: api.adminDeleteUser,
    onMutate: () => toast.loading('Deleting…', { id: 'del' }),
    onSuccess: () => {
      toast.success('User deleted', { id: 'del' })
      setConfirmDelete(null)
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      qc.invalidateQueries({ queryKey: ['admin-overview'] })
    },
    onError: err => toast.error(err.message || 'Failed', { id: 'del' })
  })

  const rows = users.data?.items || []

  return (
    <>
      <SEO title="User management" />
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight">Users</h1>
        <p className="text-sm text-neutral-500">
          Search, filter, activate, deactivate, and delete accounts
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-3 lg:flex-row">
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
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Deactivated</option>
            </select>
            <select
              className="rounded-xl border border-neutral-200 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
              value={role}
              onChange={e => {
                setRole(e.target.value)
                setPage(1)
              }}
            >
              <option value="all">All roles</option>
              <option value="admin">Admins</option>
              <option value="user">Users</option>
            </select>
            <select
              className="rounded-xl border border-neutral-200 bg-transparent px-3 py-2 text-sm dark:border-neutral-700"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="name">Name</option>
              <option value="followers">Followers</option>
            </select>
            <Button
              variant="outline"
              onClick={() => qc.invalidateQueries({ queryKey: ['admin-users'] })}
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
                <table className="w-full min-w-[860px] text-left text-sm">
                  <thead>
                    <tr className="border-b text-xs uppercase text-neutral-500">
                      <th className="pb-2 pr-3 font-medium">User</th>
                      <th className="pb-2 pr-3 font-medium">Email</th>
                      <th className="pb-2 pr-3 font-medium">Role</th>
                      <th className="pb-2 pr-3 font-medium">Status</th>
                      <th className="pb-2 pr-3 font-medium">Followers</th>
                      <th className="pb-2 pr-3 font-medium">Joined</th>
                      <th className="pb-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(u => (
                      <tr
                        key={u.id}
                        className="border-b border-neutral-100 dark:border-neutral-800"
                      >
                        <td className="py-3 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="relative">
                              <UserAvatar user={u} className="h-9 w-9" />
                              {u.isOnline && (
                                <span
                                  className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-neutral-900"
                                  title="Online"
                                />
                              )}
                            </span>
                            <div>
                              <p className="font-semibold">{u.name}</p>
                              <p className="text-xs text-neutral-500">
                                @{u.username}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-3 text-neutral-600 dark:text-neutral-300">
                          {u.email}
                        </td>
                        <td className="py-3 pr-3">
                          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium capitalize dark:bg-neutral-800">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 pr-3">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold',
                              u.isActive
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                            )}
                          >
                            {u.isOnline && <Wifi className="h-3 w-3" />}
                            {u.isActive ? 'Active' : 'Deactivated'}
                          </span>
                        </td>
                        <td className="py-3 pr-3 tabular-nums">
                          {u.followersCount ?? 0}
                        </td>
                        <td className="py-3 pr-3 text-neutral-500">
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleDateString()
                            : '—'}
                        </td>
                        <td className="py-3">
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={
                                statusMutation.isPending || u.id === me?.id
                              }
                              onClick={() =>
                                statusMutation.mutate({
                                  id: u.id,
                                  active: !u.isActive
                                })
                              }
                              title={
                                u.isActive ? 'Deactivate' : 'Activate'
                              }
                            >
                              {u.isActive ? (
                                <UserX className="h-4 w-4" />
                              ) : (
                                <UserCheck className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-rose-600"
                              disabled={
                                deleteMutation.isPending || u.id === me?.id
                              }
                              onClick={() => setConfirmDelete(u)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {rows.length === 0 && (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-10 text-center text-neutral-500"
                        >
                          No users match your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-neutral-500">
                  {users.data?.total ?? 0} accounts · page {page} of{' '}
                  {Math.max(1, users.data?.pages || 1)}
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
                    disabled={page >= (users.data?.pages || 1)}
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

      {confirmDelete && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          onMouseDown={e => {
            if (e.target === e.currentTarget) setConfirmDelete(null)
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-5 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950"
          >
            <h2 className="text-lg font-extrabold">Delete user?</h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">
              Permanently delete{' '}
              <strong>
                {confirmDelete.name} (@{confirmDelete.username})
              </strong>
              . This cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmDelete(null)}>
                Cancel
              </Button>
              <Button
                className="bg-rose-600 hover:bg-rose-700"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(confirmDelete.id)}
              >
                Delete permanently
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
