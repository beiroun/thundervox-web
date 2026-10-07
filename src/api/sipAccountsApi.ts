// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithReauth, unwrapEnvelope } from '@/api/baseQuery';
import type {
  BaseApiResponse,
  CreateSipAccountRequest,
  SipAccount,
  SipAccountCredentials,
  UpdateSipAccountDetailsRequest,
} from '@/api/types';

/** SIP numbers of panels and app clients. Every change refetches the list, which also carries the online state. */
export const sipAccountsApi = createApi({
  reducerPath: 'sipAccountsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['SipAccount'],
  endpoints: (builder) => ({
    listSipAccounts: builder.query<SipAccount[], void>({
      query: () => '/sip-accounts',
      transformResponse: (response: BaseApiResponse<SipAccount[]>) => unwrapEnvelope(response),
      providesTags: ['SipAccount'],
    }),
    createSipAccount: builder.mutation<SipAccountCredentials, CreateSipAccountRequest>({
      query: (body) => ({ url: '/sip-accounts', method: 'POST', body }),
      transformResponse: (response: BaseApiResponse<SipAccountCredentials>) => unwrapEnvelope(response),
      invalidatesTags: ['SipAccount'],
    }),
    updateSipAccountDetails: builder.mutation<SipAccount, { id: number } & UpdateSipAccountDetailsRequest>({
      query: ({ id, ...body }) => ({ url: `/sip-accounts/${id}`, method: 'PUT', body }),
      transformResponse: (response: BaseApiResponse<SipAccount>) => unwrapEnvelope(response),
      invalidatesTags: ['SipAccount'],
    }),
    rotateSipAccountPassword: builder.mutation<SipAccountCredentials, { id: number; password?: string }>({
      query: ({ id, password }) => ({ url: `/sip-accounts/${id}/password`, method: 'POST', body: { password } }),
      transformResponse: (response: BaseApiResponse<SipAccountCredentials>) => unwrapEnvelope(response),
      invalidatesTags: ['SipAccount'],
    }),
    setSipAccountBlocked: builder.mutation<SipAccount, { id: number; blocked: boolean }>({
      query: ({ id, blocked }) => ({ url: `/sip-accounts/${id}/${blocked ? 'block' : 'unblock'}`, method: 'POST' }),
      transformResponse: (response: BaseApiResponse<SipAccount>) => unwrapEnvelope(response),
      invalidatesTags: ['SipAccount'],
    }),
    deleteSipAccount: builder.mutation<boolean, number>({
      query: (id) => ({ url: `/sip-accounts/${id}`, method: 'DELETE' }),
      transformResponse: (response: BaseApiResponse<boolean>) => unwrapEnvelope(response),
      invalidatesTags: ['SipAccount'],
    }),
  }),
});

export const {
  useListSipAccountsQuery,
  useCreateSipAccountMutation,
  useUpdateSipAccountDetailsMutation,
  useRotateSipAccountPasswordMutation,
  useSetSipAccountBlockedMutation,
  useDeleteSipAccountMutation,
} = sipAccountsApi;
