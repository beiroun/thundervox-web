// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { fetchBaseQuery, type FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

import type { RootState } from '@/store/store';
import type { BaseApiResponse } from '@/api/types';

/**
 * Base query of every API slice: same-origin /api/v1 (nginx proxies it to the server), bearer token from the
 * auth slice when present. Token refresh (baseQueryWithReauth) arrives together with the server's login endpoint.
 */
export const baseQuery = fetchBaseQuery({
  baseUrl: '/api/v1',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

/** Unwraps the server envelope; a FAIL envelope on a 2xx is treated as an error, not as data. */
export function unwrapEnvelope<T>(response: BaseApiResponse<T>): T {
  if (response.message !== 'OK' || response.data === null) {
    throw new Error(response.error?.localizedMessage ?? response.error?.message ?? 'Empty response');
  }
  return response.data;
}

/** Operator-facing text for an RTK Query error: the envelope's localized message when the server sent one. */
export function describeApiError(error: FetchBaseQueryError | { message?: string } | undefined): string {
  if (!error) {
    return 'Unknown error';
  }
  if ('status' in error) {
    const envelope = error.data as Partial<BaseApiResponse<unknown>> | undefined;
    const fromServer = envelope?.error?.localizedMessage ?? envelope?.error?.message;
    if (fromServer) {
      return fromServer;
    }
    if (error.status === 'FETCH_ERROR') {
      return 'Server is unreachable';
    }
    return `Request failed (${String(error.status)})`;
  }
  return error.message ?? 'Unknown error';
}
