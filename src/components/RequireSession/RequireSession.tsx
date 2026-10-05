// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';

import { useAppSelector } from '@/store/store';
import { routePaths } from '@/shared/navigation';

/** Where the login page sends the operator back to after a successful login. */
export interface LoginRedirectState {
  from?: string;
}

/**
 * Lets only a logged-in operator through; everyone else lands on the login page and comes back afterwards.
 * Reacts to the session ending mid-way too (a 401 clears the token), not only to the first visit.
 */
export function RequireSession({ children }: { children: ReactNode }) {
  const token = useAppSelector((state) => state.auth.token);
  const location = useLocation();

  if (!token) {
    const redirectState: LoginRedirectState = { from: location.pathname + location.search };
    return <Navigate to={routePaths.login} replace state={redirectState} />;
  }
  return children;
}
