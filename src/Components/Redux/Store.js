// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import streamReducer from "./streamSlice";

// const store = configureStore({
//   reducer: {
//     user: userReducer,
//     stream: streamReducer,
//   },
// });

const store = configureStore({
  reducer: {
    user: userReducer,
    stream: streamReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(() => (next) => (action) => {
      if (!action || typeof action.type !== "string") {
        console.error("🚨 Invalid Redux action dispatched:", action);
      }
      return next(action);
    }),
});


export * from "./userSlice";
export * from "./streamSlice";
export default store;
