// import { configureStore, createSlice } from "@reduxjs/toolkit";

// // Auth Slice (Stores Firebase user data)
// const authSlice = createSlice({
//   name: "auth",
//   initialState: {
//     firebaseUser: null, 
//     profilePic: null, 
//   },
//   reducers: {
//     setFirebaseUser: (state, action) => {
//       const { uid, email, displayName, photoURL } = action.payload || {};
//       state.firebaseUser = { uid, email, displayName, photoURL }; 
//     },
//     updateProfilePic: (state, action) => {
//       state.profilePic = action.payload; 
//     },
//     logoutUser: (state) => {
//       state.firebaseUser = null;
//       state.profilePic = null;
//     },
//   },
// });

// export const { setFirebaseUser, updateProfilePic, logoutUser } = authSlice.actions;

// const store = configureStore({
//   reducer: {
//     auth: authSlice.reducer,
//   },
// });

// export default store; 


import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice.js"; 

const store = configureStore({
  reducer: {
    user: userReducer, 
  },
});

export default store;



