import { createSlice } from "@reduxjs/toolkit";

const read = () => {
  try {
    return localStorage.getItem("theme") || "system";
  } catch {
    return "system";
  }
};

// mode: "light" | "dark" | "system"
const themeSlice = createSlice({
  name: "theme",
  initialState: { mode: read() },
  reducers: {
    setTheme(state, { payload }) {
      state.mode = payload;
      try {
        localStorage.setItem("theme", payload);
      } catch {
        /* ignore */
      }
    },
  },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;
