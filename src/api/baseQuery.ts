// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import {
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';

import type { RootState } from '@/store/store';
import type { BaseApiResponse } from '@/api/types';
import { sessionEnded } from '@/store/AuthSlice';

/**
 * Base query of every API slice: same-origin /api/v1 (nginx proxies it to the server), bearer token from the
 * auth slice when present.
 *
 * VITE_API_BASE_URL overrides the origin for a console that is served separately from its API; it stays empty
 * in the standard deployment, where the same name serves both and no CORS is involved.
 */
export const baseQuery = fetchBaseQuery({
  // `||`, not `??`: an image built without the argument gets an empty string, which must fall back too
  baseUrl: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

/**
 * baseQuery that ends the session on 401: the token expired, was revoked by a password reset, or the user was
 * blocked. There is no refresh token in this version - the operator logs in again. 413 (role not allowed) is an
 * ordinary error and keeps the session.
 */
export const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const result = await baseQuery(args, api, extraOptions);
  if (result.error?.status === 401 && (api.getState() as RootState).auth.token) {
    api.dispatch(sessionEnded());
  }
  return result;
};

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
