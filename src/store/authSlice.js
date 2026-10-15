import { createSlice } from '@reduxjs/toolkit'
const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null },
  reducers: {
    login(state, { payload }) {
      state.user = payload || null
    },
    logout(state) {
      state.user = null
    },
    updateProfile(state, { payload }) {
      if (state.user) state.user = { ...state.user, ...payload }
    }
  }
})
export const { login, logout, updateProfile } = authSlice.actions
export default authSlice.reducer
