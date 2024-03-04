import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

const initialState: any = null;

export const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    changeState: (
      state,
      action: PayloadAction<any>
    ) => {
      state = action.payload;
    },
  },
});

export const {
  changeState,
} = playerSlice.actions;

export default playerSlice.reducer;
