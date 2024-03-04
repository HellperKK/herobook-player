import { configureStore } from "@reduxjs/toolkit";
import gameSlice from "./gameSlice";
import playerSlice  from "./playSlice";

export const store = configureStore({
  reducer: {
    game: gameSlice,
    playerState: playerSlice,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
