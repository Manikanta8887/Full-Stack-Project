// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import streamReducer from "./streamSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    stream: streamReducer,
  },
});

export * from "./userSlice";
export * from "./streamSlice";
export default store;
