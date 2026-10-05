// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { createBrowserRouter } from 'react-router';

import { AppLayout } from '@/components/AppLayout/AppLayout';
import { RequireSession } from '@/components/RequireSession/RequireSession';
import { Audit } from '@/pages/Audit/Audit';
import { ConsoleUsers } from '@/pages/ConsoleUsers/ConsoleUsers';
import { Dashboard } from '@/pages/Dashboard/Dashboard';
import { Login } from '@/pages/Login/Login';
import { NotFound } from '@/pages/NotFound/NotFound';
import { SipAccounts } from '@/pages/SipAccounts/SipAccounts';
import { routePaths } from '@/shared/navigation';

// Created once outside the React tree, as React Router 8 requires for data routers
// `handle.title` is what useDocumentTitle() puts in the browser tab; it is also the page heading, so the two
// never drift apart.
export const router = createBrowserRouter([
  { path: routePaths.login, element: <Login />, handle: { title: 'Log in' } },
  {
    path: routePaths.dashboard,
    element: (
      <RequireSession>
        <AppLayout />
      </RequireSession>
    ),
    children: [
      { index: true, element: <Dashboard />, handle: { title: 'Dashboard' } },
      { path: routePaths.sipAccounts, element: <SipAccounts />, handle: { title: 'SIP numbers' } },
      { path: routePaths.consoleUsers, element: <ConsoleUsers />, handle: { title: 'Console users' } },
      { path: routePaths.audit, element: <Audit />, handle: { title: 'Audit' } },
      { path: '*', element: <NotFound />, handle: { title: 'Page not found' } },
    ],
  },
]);
