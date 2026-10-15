const API_BASE = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
).replace(/\/$/, '')
let accessToken = null
export const setAccessToken = token => {
  accessToken = token || null
}
export const getAccessToken = () => accessToken

async function request(path, options = {}, retry = true) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  }
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`
  let response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      credentials: 'include'
    })
  } catch {
    throw new Error(`Cannot connect to server. Check API URL: ${API_BASE}`)
  }
  let body = {}
  try {
    body = await response.json()
  } catch {
    /* empty response */
  }
  if (response.status === 401 && retry && !path.startsWith('/auth/')) {
    const refreshed = await refreshSession().catch(() => false)
    if (refreshed) return request(path, options, false)
  }
  if (!response.ok || body.success === false) {
    const error = new Error(
      body.message ||
        body.error?.message ||
        `Request failed (${response.status})`
    )
    error.status = response.status
    error.code = body.code || body.error?.code
    throw error
  }
  return body
}
const json = (method, data) => ({ method, body: JSON.stringify(data) })
export async function refreshSession() {
  const result = await request('/auth/refresh', json('POST', {}), false)
  setAccessToken(result.data?.accessToken)
  return Boolean(result.data?.accessToken)
}
export const api = {
  async adminOverview() { return (await request('/admin/overview')).data },
  async adminAnalytics(params = {}) { const q = new URLSearchParams(params); return (await request(`/admin/analytics?${q}`)).data },
  async adminUsers(params = {}) { const q = new URLSearchParams(params); return (await request(`/admin/users?${q}`)).data },
  async adminUser(id) { return (await request(`/admin/users/${encodeURIComponent(id)}`)).data },
  async adminSetUserStatus(id, isActive) { return (await request(`/admin/users/${encodeURIComponent(id)}/status`, json('PATCH', { isActive }))).data },
  async adminDeleteUser(id) { return request(`/admin/users/${encodeURIComponent(id)}`, { method: 'DELETE' }) },
  async adminPosts(params = {}) { const q = new URLSearchParams(params); return (await request(`/admin/posts?${q}`)).data },
  async adminDeletePost(id) { return request(`/admin/posts/${encodeURIComponent(id)}`, { method: 'DELETE' }) },
  async session() {
    if (!accessToken) {
      try {
        await refreshSession()
      } catch {
        return null
      }
    }
    try {
      const result = await request('/auth/me')
      return result.data || null
    } catch {
      setAccessToken(null)
      try {
        await refreshSession()
        const result = await request('/auth/me', {}, false)
        return result.data || null
      } catch {
        setAccessToken(null)
        return null
      }
    }
  },
  async login(data) {
    const r = await request('/auth/login', json('POST', data), false)
    setAccessToken(r.data.accessToken)
    return r.data
  },
  async register(data) {
    return request('/auth/register', json('POST', data), false)
  },
  async verifyEmail(data) {
    const r = await request('/auth/verify-email', json('POST', data), false)
    setAccessToken(r.data.accessToken)
    return r.data
  },
  async resendCode(data) {
    return request('/auth/resend-code', json('POST', data), false)
  },
  async logout() {
    try {
      await request('/auth/logout', json('POST', {}), false)
    } finally {
      setAccessToken(null)
    }
  },
  async feed(params = {}) {
    const q = new URLSearchParams({ limit: '20', ...params })
    return (await request(`/posts?${q}`)).data || []
  },
  async post(id) {
    return (await request(`/posts/${encodeURIComponent(id)}`)).data
  },
  async createPost(data) {
    return (await request('/posts', json('POST', data))).data
  },
  async deletePost(id) {
    return request(`/posts/${encodeURIComponent(id)}`, { method: 'DELETE' })
  },
  async likePost(post) {
    return (
      await request(
        `/posts/${post.id}/like`,
        json(post.liked ? 'DELETE' : 'POST', {})
      )
    ).data
  },
  async bookmarkPost(post) {
    return (
      await request(
        `/posts/${post.id}/bookmark`,
        json(post.bookmarked ? 'DELETE' : 'POST', {})
      )
    ).data
  },
  async sharePost(id) {
    return (await request(`/posts/${id}/share`, json('POST', {}))).data
  },
  async comments(id) {
    return (await request(`/posts/${id}/comments?limit=50`)).data || []
  },
  async addComment(id, text, parentId) {
    return (
      await request(
        `/posts/${id}/comments`,
        json('POST', { text, ...(parentId ? { parentId } : {}) })
      )
    ).data
  },
  async profile(username) {
    return (await request(`/users/${encodeURIComponent(username)}`)).data
  },
  async profilePosts(username) {
    return (
      (await request(`/users/${encodeURIComponent(username)}/posts?limit=20`))
        .data || []
    )
  },
  async updateProfile(data) {
    return (await request('/users/me', json('PATCH', data))).data
  },
  async follow(username, following) {
    return request(`/users/${encodeURIComponent(username)}/follow`, {
      method: following ? 'DELETE' : 'POST'
    })
  },
  async searchUsers(q) {
    return (
      (await request(`/users/search?q=${encodeURIComponent(q)}`)).data || []
    )
  },
  async trending() {
    return (await request('/posts/trending')).data || []
  },
  async bookmarks() {
    return (await request('/posts/bookmarks?limit=20')).data || []
  },
  async suggestions() {
    return (await request('/users/suggestions')).data || []
  },
  async notifications() {
    return (await request('/notifications?limit=30')).data || []
  },
  async unreadNotificationCount() {
    return (await request('/notifications/unread-count')).data?.count || 0
  },
  async markNotificationRead(id) {
    return request(`/notifications/${encodeURIComponent(id)}/read`, { method: 'PATCH' })
  },
  async deleteNotification(id) {
    return request(`/notifications/${encodeURIComponent(id)}`, { method: 'DELETE' })
  },
  async followers(username) {
    // Backend returns { success, data: itemsArray, nextCursor }
    return (await request(`/users/${encodeURIComponent(username)}/followers?limit=50`)).data || []
  },
  async following(username) {
    // Backend returns { success, data: itemsArray, nextCursor }
    return (await request(`/users/${encodeURIComponent(username)}/following?limit=50`)).data || []
  },
  async updatePost(id, data) {
    return (await request(`/posts/${encodeURIComponent(id)}`, json('PATCH', data))).data
  },
  async markAllNotificationsRead() {
    return request('/notifications/read-all', { method: 'PATCH' })
  },
  async clearNotifications() {
    return request('/notifications', { method: 'DELETE' })
  },
  async communities() {
    return (await request('/communities')).data || []
  },
  async joinCommunity(id, joined) {
    return request(`/communities/${id}/join`, {
      method: joined ? 'DELETE' : 'POST'
    })
  },
  async events() {
    return (await request('/events')).data || []
  },
  async attendEvent(id, going) {
    return request(`/events/${id}/going`, { method: going ? 'DELETE' : 'POST' })
  },
  async conversations() {
    return (await request('/messages/conversations')).data || []
  },
  async startConversation(username) {
    return (
      await request('/messages/conversations', json('POST', { username }))
    ).data
  },
  async messages(id) {
    return (
      (await request(`/messages/conversations/${id}/messages?limit=50`)).data ||
      []
    )
  },
  async videoUploadSignature() { return (await request('/uploads/video-signature', json('POST', {}))).data },
  async imageUploadSignature() { return (await request('/uploads/image-signature', json('POST', {}))).data },
  async sendMessage(id, text) {
    return (
      await request(
        `/messages/conversations/${id}/messages`,
        json('POST', { text })
      )
    ).data
  }
}
export function normalizePost(post) {
  if (!post) return post
  return {
    ...post,
    author: post.author || {},
    image: post.image || null,
    video: post.video || null,
    likes: post.likesCount ?? post.likes ?? 0,
    commentsCount: post.commentsCount ?? 0,
    shares: post.sharesCount ?? post.shares ?? 0,
    comments: post.comments || [],
    liked: Boolean(post.liked),
    bookmarked: Boolean(post.bookmarked),
    createdAt: post.createdAt ? new Date(post.createdAt).getTime() : Date.now()
  }
}
export function normalizeComment(comment) {
  return {
    ...comment,
    user: comment.author || comment.user || {},
    createdAt: comment.createdAt
      ? new Date(comment.createdAt).getTime()
      : Date.now()
  }
}
