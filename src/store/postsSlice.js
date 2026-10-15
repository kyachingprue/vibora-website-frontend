import { createSlice } from '@reduxjs/toolkit'
const postsSlice = createSlice({
  name: 'posts',
  initialState: { items: [] },
  reducers: {
    setPosts(state, { payload }) {
      state.items = payload || []
    },
    clearPosts(state) {
      state.items = []
    }
  }
})
export const { setPosts, clearPosts } = postsSlice.actions
export default postsSlice.reducer
