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
    getAuditPage: builder.query<AuditPage, { page: number; size: number }>({
      query: ({ page, size }) => ({ url: '/audit', params: { page, size } }),
      transformResponse: (response: BaseApiResponse<AuditPage>) => unwrapEnvelope(response),
    }),
  }),
});

export const { useGetAuditPageQuery } = auditApi;
