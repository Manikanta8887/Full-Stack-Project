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
//       if (action.payload) localStorage.setItem("isStreaming", "true");
//       else localStorage.removeItem("isStreaming");
//     },
//     setStreamTitle: (state, action) => {
//       state.streamTitle = action.payload;
//       if (action.payload) localStorage.setItem("streamTitle", action.payload);
//       else localStorage.removeItem("streamTitle");
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
  streamId: localStorage.getItem("streamId") || "",  // ✅ NEW
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
    setStreamId: (state, action) => {   // ✅ NEW
      state.streamId = action.payload;
      if (action.payload) localStorage.setItem("streamId", action.payload);
      else localStorage.removeItem("streamId");
    },
  },
});

export const { setIsStreaming, setStreamTitle, setStreamId } = streamSlice.actions;
export default streamSlice.reducer;
