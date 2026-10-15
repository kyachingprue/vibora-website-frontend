import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { useDispatch, useSelector } from 'react-redux'
import ThemeProvider from '@/components/ThemeProvider'
import Layout from '@/components/layout/Layout'
import AdminLayout from '@/components/admin/AdminLayout'
import { api } from '@/lib/api'
import { login } from '@/store/authSlice'
import { connectSocket, disconnectSocket } from '@/lib/socket'
import PageLoader from '@/components/loading/PageLoader'

const Home = lazy(() => import('@/pages/Home'))
const Explore = lazy(() => import('@/pages/Explore'))
const Reels = lazy(() => import('@/pages/Reels'))
const Messages = lazy(() => import('@/pages/Messages'))
const Notifications = lazy(() => import('@/pages/Notifications'))
const Bookmarks = lazy(() => import('@/pages/Bookmarks'))
const Communities = lazy(() => import('@/pages/Communities'))
const Events = lazy(() => import('@/pages/Events'))
const Profile = lazy(() => import('@/pages/Profile'))
const PostDetail = lazy(() => import('@/pages/PostDetail'))
const Create = lazy(() => import('@/pages/Create'))
const Settings = lazy(() => import('@/pages/Settings'))
const Auth = lazy(() => import('@/pages/Auth'))
const NotFound = lazy(() => import('@/pages/NotFound'))
const AdminOverview = lazy(() => import('@/pages/admin/AdminOverview'))
const AdminAnalytics = lazy(() => import('@/pages/admin/AdminAnalytics'))
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'))
const AdminPosts = lazy(() => import('@/pages/admin/AdminPosts'))
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings'))

const Loader = () => <PageLoader />

function isAdminRole(role) {
  const r = String(role || '').toLowerCase()
  return r === 'admin' || r === 'administrator'
}

function RequireAuth() {
  const location = useLocation()
  const dispatch = useDispatch()
  const authUser = useSelector(s => s.auth.user)
  const session = useQuery({
    queryKey: ['session'],
    queryFn: () => api.session(),
    staleTime: 60_000
  })
  useEffect(() => {
    if (session.data) {
      dispatch(login(session.data))
      connectSocket()
    }
  }, [session.data, dispatch])
  if (session.isPending) return <Loader />
  if (!session.data)
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (authUser?.id !== session.data.id) return <Loader />
  return <Outlet />
}

function RequireAdmin() {
  const location = useLocation()
  const user = useSelector(s => s.auth.user)
  if (!isAdminRole(user?.role)) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}

function GuestOnly({ mode }) {
  const session = useQuery({
    queryKey: ['session'],
    queryFn: () => api.session(),
    staleTime: 60_000
  })
  if (session.isPending) return <Loader />
  if (session.data) return <Navigate to="/" replace />
  return <Auth mode={mode} />
}

export default function App() {
  return (
    <ThemeProvider>
      <Suspense fallback={<PageLoader variant="page" />}>
        <Routes>
          <Route path="/login" element={<GuestOnly mode="login" />} />
          <Route path="/register" element={<GuestOnly mode="register" />} />
          <Route element={<RequireAuth />}>
            {/* Admin area — separate layout */}
            <Route path="admin" element={<RequireAdmin />}>
              <Route element={<AdminLayout />}>
                <Route index element={<AdminOverview />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="posts" element={<AdminPosts />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Route>

            {/* User app layout */}
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="explore" element={<Explore />} />
              <Route path="reels" element={<Reels />} />
              <Route path="messages" element={<Messages />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="bookmarks" element={<Bookmarks />} />
              <Route path="communities" element={<Communities />} />
              <Route path="events" element={<Events />} />
              <Route path="profile" element={<Profile />} />
              <Route path="profile/:username" element={<Profile />} />
              <Route path="post/:id" element={<PostDetail />} />
              <Route path="create" element={<Create />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </ThemeProvider>
  )
}
