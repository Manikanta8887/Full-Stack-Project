// import { createSlice } from "@reduxjs/toolkit";

// // Initial state for user data
// const initialState = {
//   firebaseUser: null, // To store user data from Firebase (uid, email, displayName, photoURL)
//   profilePic: null,   // To store the user's profile picture URL
//   bio: "",            // Additional user bio
// };

// const userSlice = createSlice({
//   name: "user",
//   initialState,
//   reducers: {
//     // Set the Firebase user data
//     setFirebaseUser: (state, action) => {
//       const { uid, email, displayName, photoURL, bio } = action.payload || {};
//       state.firebaseUser = { uid, email, displayName, photoURL };
//       state.bio = bio || "";
//     },
//     // Update the user's profile picture
//     updateProfilePic: (state, action) => {
//       state.profilePic = action.payload;
//       // Also update firebaseUser.photoURL if firebaseUser exists.
//       if (state.firebaseUser) {
//         state.firebaseUser.photoURL = action.payload;
//       }
//     },
//     // Update the user's profile (merges updated fields)
//     updateUser: (state, action) => {
//       if (state.firebaseUser) {
//         state.firebaseUser = { ...state.firebaseUser, ...action.payload };
//       } else {
//         state.firebaseUser = action.payload;
//       }
//       if (action.payload.profilePic) {
//         state.profilePic = action.payload.profilePic;
//       }
//       if (action.payload.bio !== undefined) {
//         state.bio = action.payload.bio;
//       }
//     },
//     // Logout the user and clear the profile data
//     logoutUser: (state) => {
//       state.firebaseUser = null;
//       state.profilePic = null;
//       state.bio = "";
//     },
//   },
// });

// // Export the actions
// export const { setFirebaseUser, updateProfilePic, updateUser, logoutUser } = userSlice.actions;

// // Export the reducer to be used in the store
// export default userSlice.reducer;


import { createSlice } from "@reduxjs/toolkit";

// Initial state for user data
const initialState = {
  firebaseUser: null, // To store user data from Firebase (uid, email, displayName, photoURL)
  profilePic: null,   // To store the user's profile picture URL
  bio: "",            // Additional user bio
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Set the Firebase user data
    setFirebaseUser: (state, action) => {
      const { uid, email, displayName, photoURL, bio } = action.payload || {};
      state.firebaseUser = { uid, email, displayName, photoURL };
      state.bio = bio || "";
    },
    // Update the user's profile picture
    updateProfilePic: (state, action) => {
      state.profilePic = action.payload;
      // Also update firebaseUser.photoURL if firebaseUser exists.
      if (state.firebaseUser) {
        state.firebaseUser.photoURL = action.payload;
      }
    },
    // Update the user's profile (merges updated fields)
    updateUser: (state, action) => {
      if (state.firebaseUser) {
        state.firebaseUser = { ...state.firebaseUser, ...action.payload };
      } else {
        state.firebaseUser = action.payload;
      }
      if (action.payload.profilePic) {
        state.profilePic = action.payload.profilePic;
      }
      if (action.payload.bio !== undefined) {
        state.bio = action.payload.bio;
      }
    },
    // Logout the user and clear the profile data
    logoutUser: (state) => {
      state.firebaseUser = null;
      state.profilePic = null;
      state.bio = "";
    },
  },
});

// Export the actions
export const { setFirebaseUser, updateProfilePic, updateUser, logoutUser } = userSlice.actions;

// Export the reducer to be used in the store
export default userSlice.reducer;
