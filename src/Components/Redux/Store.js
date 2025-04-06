// import { configureStore } from "@reduxjs/toolkit";
// import userReducer, { setFirebaseUser, logoutUser, updateUser, updateProfilePic } from "./userSlice.js";

// const store = configureStore({
//   reducer: {
//     user: userReducer,
//   },
// });

// export { setFirebaseUser, logoutUser, updateUser, updateProfilePic };
// export default store;

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
