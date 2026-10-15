import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: { drawerOpen: false },
  reducers: {
    openDrawer: (s) => void (s.drawerOpen = true),
    closeDrawer: (s) => void (s.drawerOpen = false),
    toggleDrawer: (s) => void (s.drawerOpen = !s.drawerOpen),
  },
});

export const { openDrawer, closeDrawer, toggleDrawer } = uiSlice.actions;
export default uiSlice.reducer;
