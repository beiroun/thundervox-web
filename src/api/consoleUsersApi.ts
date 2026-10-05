// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithReauth, unwrapEnvelope } from '@/api/baseQuery';
import type {
  BaseApiResponse,
  ConsoleUser,
  ConsoleUserCredentials,
  CreateConsoleUserRequest,
  UpdateConsoleUserRequest,
} from '@/api/types';

/** Console users: administrators manage readers, the super administrator manages both. */
export const consoleUsersApi = createApi({
  reducerPath: 'consoleUsersApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['ConsoleUser'],
  endpoints: (builder) => ({
    listConsoleUsers: builder.query<ConsoleUser[], void>({
      query: () => '/console-users',
      transformResponse: (response: BaseApiResponse<ConsoleUser[]>) => unwrapEnvelope(response),
      providesTags: ['ConsoleUser'],
    }),
    createConsoleUser: builder.mutation<ConsoleUserCredentials, CreateConsoleUserRequest>({
      query: (body) => ({ url: '/console-users', method: 'POST', body }),
      transformResponse: (response: BaseApiResponse<ConsoleUserCredentials>) => unwrapEnvelope(response),
      invalidatesTags: ['ConsoleUser'],
    }),
    updateConsoleUser: builder.mutation<ConsoleUser, { id: number } & UpdateConsoleUserRequest>({
      query: ({ id, ...body }) => ({ url: `/console-users/${id}`, method: 'PUT', body }),
      transformResponse: (response: BaseApiResponse<ConsoleUser>) => unwrapEnvelope(response),
      invalidatesTags: ['ConsoleUser'],
    }),
    resetConsoleUserPassword: builder.mutation<ConsoleUserCredentials, { id: number; password?: string }>({
      query: ({ id, password }) => ({ url: `/console-users/${id}/password`, method: 'POST', body: { password } }),
      transformResponse: (response: BaseApiResponse<ConsoleUserCredentials>) => unwrapEnvelope(response),
      invalidatesTags: ['ConsoleUser'],
    }),
  }),
});

export const {
  useListConsoleUsersQuery,
  useCreateConsoleUserMutation,
  useUpdateConsoleUserMutation,
  useResetConsoleUserPasswordMutation,
} = consoleUsersApi;
