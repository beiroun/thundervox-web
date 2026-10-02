// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQuery, unwrapEnvelope } from '@/api/baseQuery';
import type { BaseApiResponse, PlatformInfo } from '@/api/types';

/** Platform-level endpoints of the server: identity and version. */
export const platformApi = createApi({
  reducerPath: 'platformApi',
  baseQuery,
  endpoints: (builder) => ({
    getPlatformInfo: builder.query<PlatformInfo, void>({
      query: () => '/info',
      transformResponse: (response: BaseApiResponse<PlatformInfo>) => unwrapEnvelope(response),
    }),
  }),
});

export const { useGetPlatformInfoQuery } = platformApi;
