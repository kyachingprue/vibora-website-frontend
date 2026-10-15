import { createSlice } from '@reduxjs/toolkit'

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: []
  },
  reducers: {
    setNotifications(state, { payload }) {
      state.items = payload || []
    },
    clearNotificationsState(state) {
      state.items = []
    }
  }
})

export const { setNotifications, clearNotificationsState } =
  notificationsSlice.actions

export const selectUnread = state =>
  state.notifications.items.filter(notification => !notification.isRead).length

export default notificationsSlice.reducer
