// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithReauth, unwrapEnvelope } from '@/api/baseQuery';
import type {
  BaseApiResponse,
  IntegrationOverview,
  IssuedServiceToken,
  IssueServiceTokenRequest,
  PushSettings,
  PushTestRequest,
  PushTestResult,
  ServiceToken,
  UpdatePushSettingsRequest,
} from '@/api/types';

/** The Integration page: service tokens, wake push settings and test pushes (their outcome is in the event log). */
export const integrationApi = createApi({
  reducerPath: 'integrationApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Integration', 'ServiceToken'],
  endpoints: (builder) => ({
    getIntegration: builder.query<IntegrationOverview, void>({
      query: () => '/integration',
      transformResponse: (response: BaseApiResponse<IntegrationOverview>) => unwrapEnvelope(response),
      providesTags: ['Integration'],
    }),
    updatePushSettings: builder.mutation<PushSettings, UpdatePushSettingsRequest>({
      query: (body) => ({ url: '/integration/push', method: 'PUT', body }),
      transformResponse: (response: BaseApiResponse<PushSettings>) => unwrapEnvelope(response),
      invalidatesTags: ['Integration'],
    }),
    sendTestPush: builder.mutation<PushTestResult, PushTestRequest>({
      query: (body) => ({ url: '/integration/push/test', method: 'POST', body }),
      transformResponse: (response: BaseApiResponse<PushTestResult>) => unwrapEnvelope(response),
    }),
    listServiceTokens: builder.query<ServiceToken[], void>({
      query: () => '/integration/tokens',
      transformResponse: (response: BaseApiResponse<ServiceToken[]>) => unwrapEnvelope(response),
      providesTags: ['ServiceToken'],
    }),
    issueServiceToken: builder.mutation<IssuedServiceToken, IssueServiceTokenRequest>({
      query: (body) => ({ url: '/integration/tokens', method: 'POST', body }),
      transformResponse: (response: BaseApiResponse<IssuedServiceToken>) => unwrapEnvelope(response),
      invalidatesTags: ['ServiceToken'],
    }),
    revokeServiceToken: builder.mutation<ServiceToken, number>({
      query: (id) => ({ url: `/integration/tokens/${id}`, method: 'DELETE' }),
      transformResponse: (response: BaseApiResponse<ServiceToken>) => unwrapEnvelope(response),
      invalidatesTags: ['ServiceToken'],
    }),
  }),
});

export const {
  useGetIntegrationQuery,
  useUpdatePushSettingsMutation,
  useSendTestPushMutation,
  useListServiceTokensQuery,
  useIssueServiceTokenMutation,
  useRevokeServiceTokenMutation,
} = integrationApi;
