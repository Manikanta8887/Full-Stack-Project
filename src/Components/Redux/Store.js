import { configureStore } from "@reduxjs/toolkit";
import userReducer, { setFirebaseUser, logoutUser, updateUser, updateProfilePic } from "./userSlice.js";

const store = configureStore({
  reducer: {
    user: userReducer,
  },
});

export { setFirebaseUser, logoutUser, updateUser, updateProfilePic };
export default store;

