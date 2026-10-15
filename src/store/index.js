import { configureStore } from "@reduxjs/toolkit";
import theme from "./themeSlice";
import ui from "./uiSlice";
import auth from "./authSlice";
import posts from "./postsSlice";
import chat from "./chatSlice";
import notificationsReducer from "./notificationsSlice";

export const store = configureStore({
  reducer: {
    theme,
    ui,
    auth,
    posts,
    chat,
    notifications: notificationsReducer,
  },
});

