// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { combineReducers } from '@reduxjs/toolkit';

import { authSlice } from '@/store/AuthSlice';
import { platformApi } from '@/api/platformApi';

export const rootReducer = combineReducers({
  [authSlice.reducerPath]: authSlice.reducer,
  [platformApi.reducerPath]: platformApi.reducer,
});
