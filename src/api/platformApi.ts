// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithReauth, unwrapEnvelope } from '@/api/baseQuery';
import type { BaseApiResponse, PlatformInfo, SipEndpoint } from '@/api/types';

/** Platform-level endpoints of the server: identity and version (public), where devices register (session). */
export const platformApi = createApi({
  reducerPath: 'platformApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getPlatformInfo: builder.query<PlatformInfo, void>({
      query: () => '/info',
      transformResponse: (response: BaseApiResponse<PlatformInfo>) => unwrapEnvelope(response),
    }),
    getSipEndpoint: builder.query<SipEndpoint, void>({
      query: () => '/info/sip',
      transformResponse: (response: BaseApiResponse<SipEndpoint>) => unwrapEnvelope(response),
    }),
  }),
});

export const { useGetPlatformInfoQuery, useGetSipEndpointQuery } = platformApi;

/** "sip.example.com:5060" - what a device is configured with. */
export const sipAddress = (endpoint: SipEndpoint) => `${endpoint.domain}:${endpoint.port}`;
