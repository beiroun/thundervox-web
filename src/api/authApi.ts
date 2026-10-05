// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithReauth, unwrapEnvelope } from '@/api/baseQuery';
import type { BaseApiResponse, ConsoleUser, LoginRequest, LoginResponse } from '@/api/types';

/** Console session: login and "who am I". */
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    logIn: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      transformResponse: (response: BaseApiResponse<LoginResponse>) => unwrapEnvelope(response),
    }),
    getCurrentUser: builder.query<ConsoleUser, void>({
      query: () => '/auth/me',
      transformResponse: (response: BaseApiResponse<ConsoleUser>) => unwrapEnvelope(response),
    }),
  }),
});

export const { useLogInMutation, useGetCurrentUserQuery } = authApi;
