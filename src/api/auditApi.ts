// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithReauth, unwrapEnvelope } from '@/api/baseQuery';
import type { AuditPage, BaseApiResponse } from '@/api/types';

/** Audit trail, newest first. */
export const auditApi = createApi({
  reducerPath: 'auditApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    /** `query` – the smart search, applied by the server; absent when the typed text would not search. */
    getAuditPage: builder.query<AuditPage, { page: number; size: number; query?: string }>({
      query: ({ page, size, query }) => ({ url: '/audit', params: { page, size, query } }),
      transformResponse: (response: BaseApiResponse<AuditPage>) => unwrapEnvelope(response),
    }),
  }),
});

export const { useGetAuditPageQuery } = auditApi;
