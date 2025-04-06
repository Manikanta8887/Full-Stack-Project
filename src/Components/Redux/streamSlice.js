// store/streamSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isStreaming: false,
  streamTitle: "",
};

const streamSlice = createSlice({
  name: "stream",
  initialState,
  reducers: {
    setIsStreaming: (state, action) => {
      state.isStreaming = action.payload;
    },
    setStreamTitle: (state, action) => {
      state.streamTitle = action.payload;
    },
  },
});

export const { setIsStreaming, setStreamTitle } = streamSlice.actions;
export default streamSlice.reducer;
