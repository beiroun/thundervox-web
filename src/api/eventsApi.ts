// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { createApi } from '@reduxjs/toolkit/query/react';

import { baseQueryWithReauth, unwrapEnvelope } from '@/api/baseQuery';
import type { BaseApiResponse, ServerEventCategory, ServerEventPage } from '@/api/types';

export interface ServerEventPageArgs {
  page: number;
  size: number;
  /** One journal; absent – every journal the viewer may see. */
  category?: ServerEventCategory;
  /** Only what did not get through. */
  problems?: boolean;
  /** The smart search, applied by the server; absent when the typed text would not search. */
  query?: string;
}

/** The event log: what happens on the server, newest first. */
export const eventsApi = createApi({
  reducerPath: 'eventsApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getEvents: builder.query<ServerEventPage, ServerEventPageArgs>({
      query: ({ page, size, category, problems, query }) => ({
        url: '/events',
        // false is the server's default: not written, so the address of a request stays the shortest one
        params: { page, size, category, problems: problems || undefined, query },
      }),
      transformResponse: (response: BaseApiResponse<ServerEventPage>) => unwrapEnvelope(response),
    }),
  }),
});

export const { useGetEventsQuery } = eventsApi;
