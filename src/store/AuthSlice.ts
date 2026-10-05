// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { ConsoleUser } from '@/api/types';
import { readStoredSession } from '@/shared/sessionPersistence';

export interface AuthState {
  /** Bearer token from POST /auth/login; null while logged out. Never logged. */
  token: string | null;
  user: ConsoleUser | null;
}

const storedSession = readStoredSession();

const initialState: AuthState = {
  token: storedSession?.token ?? null,
  user: storedSession?.user ?? null,
};

/** Operator session. Persisted by the store (see store.ts); ended by a logout or by any 401 from the server. */
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sessionStarted: (state, action: PayloadAction<{ token: string; user: ConsoleUser }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    /** GET /auth/me answered: the role or the flags may have changed since login. */
    currentUserRefreshed: (state, action: PayloadAction<ConsoleUser>) => {
      state.user = action.payload;
    },
    sessionEnded: (state) => {
      state.token = null;
      state.user = null;
    },
  },
});

export const { sessionStarted, currentUserRefreshed, sessionEnded } = authSlice.actions;
