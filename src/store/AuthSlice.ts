// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  /** JWT issued by POST /auth/login; null while logged out. Never logged. */
  token: string | null;
  login: string | null;
}

const initialState: AuthState = {
  token: null,
  login: null,
};

/** Operator session. Persistence and refresh come with the server's login endpoint. */
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sessionStarted: (state, action: PayloadAction<{ token: string; login: string }>) => {
      state.token = action.payload.token;
      state.login = action.payload.login;
    },
    sessionEnded: (state) => {
      state.token = null;
      state.login = null;
    },
  },
});

export const { sessionStarted, sessionEnded } = authSlice.actions;
