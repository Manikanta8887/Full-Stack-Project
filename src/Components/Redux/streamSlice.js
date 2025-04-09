// // Redux/streamSlice.js
// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//   isStreaming: localStorage.getItem("isStreaming") === "true",
//   streamTitle: localStorage.getItem("streamTitle") || "",
// };

// const streamSlice = createSlice({
//   name: "stream",
//   initialState,
//   reducers: {
//     setIsStreaming: (state, action) => {
//       state.isStreaming = action.payload;
//       localStorage.setItem("isStreaming", action.payload);
//     },
//     setStreamTitle: (state, action) => {
//       state.streamTitle = action.payload;
//       localStorage.setItem("streamTitle", action.payload);
//     },
//   },
// });

// export const { setIsStreaming, setStreamTitle } = streamSlice.actions;
// export default streamSlice.reducer;


// Redux/streamSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isStreaming: localStorage.getItem("isStreaming") === "true",
  streamTitle: localStorage.getItem("streamTitle") || "",
};

const streamSlice = createSlice({
  name: "stream",
  initialState,
  reducers: {
    setIsStreaming: (state, action) => {
      state.isStreaming = action.payload;
      if (action.payload) localStorage.setItem("isStreaming", "true");
      else localStorage.removeItem("isStreaming");
    },
    setStreamTitle: (state, action) => {
      state.streamTitle = action.payload;
      if (action.payload) localStorage.setItem("streamTitle", action.payload);
      else localStorage.removeItem("streamTitle");
    },
  },
});

export const { setIsStreaming, setStreamTitle } = streamSlice.actions;
export default streamSlice.reducer;
