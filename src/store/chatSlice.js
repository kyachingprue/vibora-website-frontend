import { createSlice } from '@reduxjs/toolkit'
const chatSlice = createSlice({
  name: 'chat',
  initialState: { conversations: [] },
  reducers: {
    setConversations(state, { payload }) {
      state.conversations = payload || []
    },
    clearConversations(state) {
      state.conversations = []
    }
  }
})
export const { setConversations, clearConversations } = chatSlice.actions
export default chatSlice.reducer
