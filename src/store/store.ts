// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import { apiSlices, rootReducer } from '@/store/RootReducer';
import { writeStoredSession } from '@/shared/sessionPersistence';

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlices.map((apiSlice) => apiSlice.middleware)),
});

// The session survives a reload: written whenever the auth slice changes, removed when it ends
let persistedAuth = store.getState().auth;
store.subscribe(() => {
  const auth = store.getState().auth;
  if (auth === persistedAuth) {
    return;
  }
  persistedAuth = auth;
  writeStoredSession(auth.token && auth.user ? { token: auth.token, user: auth.user } : null);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
