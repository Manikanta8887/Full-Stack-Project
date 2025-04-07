// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import streamReducer from "./streamSlice"; // NEW

const store = configureStore({
  reducer: {
    user: userReducer,
    stream: streamReducer, // ADD THIS
  },
});

export * from "./userSlice";
export * from "./streamSlice"; // EXPORT stream actions
export default store;
