// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { createBrowserRouter } from 'react-router';

import { AppLayout } from '@/components/AppLayout/AppLayout';
import { RequireSession } from '@/components/RequireSession/RequireSession';
import { About } from '@/pages/About/About';
import { Audit } from '@/pages/Audit/Audit';
import { ConsoleUsers } from '@/pages/ConsoleUsers/ConsoleUsers';
import { Dashboard } from '@/pages/Dashboard/Dashboard';
import { Integration } from '@/pages/Integration/Integration';
import { Login } from '@/pages/Login/Login';
import { NotFound } from '@/pages/NotFound/NotFound';
import { SipAccounts } from '@/pages/SipAccounts/SipAccounts';
import { pageHandle } from '@/shared/documentTitle';
import { routePaths } from '@/shared/navigation';

// Created once outside the React tree, as React Router 8 requires for data routers.
// `handle.page` names the page's copy (title and kicker) in the dictionary: useDocumentTitle() puts the title in
// the browser tab and PageHeader renders the same text as the heading, so the two never drift apart.
export const router = createBrowserRouter([
  { path: routePaths.login, element: <Login />, handle: pageHandle('login') },
  {
    path: routePaths.dashboard,
    element: (
      <RequireSession>
        <AppLayout />
      </RequireSession>
    ),
    children: [
      { index: true, element: <Dashboard />, handle: pageHandle('dashboard') },
      { path: routePaths.sipAccounts, element: <SipAccounts />, handle: pageHandle('sipAccounts') },
      { path: routePaths.consoleUsers, element: <ConsoleUsers />, handle: pageHandle('consoleUsers') },
      { path: routePaths.audit, element: <Audit />, handle: pageHandle('audit') },
      { path: routePaths.integration, element: <Integration />, handle: pageHandle('integration') },
      { path: routePaths.about, element: <About />, handle: pageHandle('about') },
      { path: '*', element: <NotFound />, handle: pageHandle('notFound') },
    ],
  },
]);
