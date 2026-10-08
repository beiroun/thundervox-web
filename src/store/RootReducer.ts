// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { combineReducers } from '@reduxjs/toolkit';

import { authSlice, sessionEnded } from '@/store/AuthSlice';
import { platformApi } from '@/api/platformApi';
import { authApi } from '@/api/authApi';
import { sipAccountsApi } from '@/api/sipAccountsApi';
import { consoleUsersApi } from '@/api/consoleUsersApi';
import { auditApi } from '@/api/auditApi';
import { integrationApi } from '@/api/integrationApi';

/** Every API slice of the console: reducers here, middleware in store.ts. */
export const apiSlices = [platformApi, authApi, sipAccountsApi, consoleUsersApi, auditApi, integrationApi] as const;

const combinedReducer = combineReducers({
  [authSlice.reducerPath]: authSlice.reducer,
  [platformApi.reducerPath]: platformApi.reducer,
  [authApi.reducerPath]: authApi.reducer,
  [sipAccountsApi.reducerPath]: sipAccountsApi.reducer,
  [consoleUsersApi.reducerPath]: consoleUsersApi.reducer,
  [auditApi.reducerPath]: auditApi.reducer,
  [integrationApi.reducerPath]: integrationApi.reducer,
});

/**
 * The end of a session wipes every cached response along with the token: the next user of this browser must not
 * see the previous user's numbers or users list, not even for a moment.
 */
export const rootReducer: typeof combinedReducer = (state, action) =>
  combinedReducer(sessionEnded.match(action) ? undefined : state, action);
