import { io } from 'socket.io-client'
import { getAccessToken } from './api'

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '')
const SOCKET_URL = API_BASE.replace(/\/api$/, '') || 'http://localhost:5000'

let socket = null

export function connectSocket() {
  if (socket?.connected) return socket
  const token = getAccessToken()
  if (!token) return null

  if (socket) {
    socket.auth = { token }
    socket.connect()
    return socket
  }

  socket = io(SOCKET_URL, {
    path: '/socket.io',
    auth: { token },
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000
  })

  socket.on('connect_error', err => {
    if (err.message === 'Unauthorized') {
      // token may have expired; leave reconnection to caller after refresh
    }
  })

  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export function getSocket() {
  return socket
}

/** Subscribe to presence events. Returns cleanup function. */
export function onPresence(handlers = {}) {
  const s = connectSocket()
  if (!s) return () => {}
  if (handlers.online) s.on('user:online', handlers.online)
  if (handlers.offline) s.on('user:offline', handlers.offline)
  if (handlers.adminUpdate) s.on('presence:update', handlers.adminUpdate)
  if (handlers.userStatus) s.on('user:status', handlers.userStatus)
  if (handlers.userDeleted) s.on('user:deleted', handlers.userDeleted)
  return () => {
    if (handlers.online) s.off('user:online', handlers.online)
    if (handlers.offline) s.off('user:offline', handlers.offline)
    if (handlers.adminUpdate) s.off('presence:update', handlers.adminUpdate)
    if (handlers.userStatus) s.off('user:status', handlers.userStatus)
    if (handlers.userDeleted) s.off('user:deleted', handlers.userDeleted)
  }
}
