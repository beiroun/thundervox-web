// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithReauth, unwrapEnvelope } from '@/api/baseQuery';
import type { BaseApiResponse, Dashboard, DashboardRange } from '@/api/types';

/** Counters and time series of the landing page; one request per selected range, re-read while the page is open. */
export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getDashboard: builder.query<Dashboard, DashboardRange>({
      query: (range) => ({ url: '/dashboard', params: { range } }),
      transformResponse: (response: BaseApiResponse<Dashboard>) => unwrapEnvelope(response),
    }),
  }),
});

export const { useGetDashboardQuery } = dashboardApi;
