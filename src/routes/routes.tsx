// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { createBrowserRouter } from 'react-router';

import { AppLayout } from '@/components/AppLayout/AppLayout';
import { Dashboard } from '@/pages/Dashboard/Dashboard';
import { NotFound } from '@/pages/NotFound/NotFound';
import { Placeholder } from '@/pages/Placeholder/Placeholder';
import { routePaths } from '@/shared/navigation';

// Created once outside the React tree, as React Router 8 requires for data routers
// `handle.title` is what useDocumentTitle() puts in the browser tab; it is also the page heading, so the two
// never drift apart.
export const router = createBrowserRouter([
  {
    path: routePaths.dashboard,
    element: <AppLayout />,
    children: [
      { index: true, element: <Dashboard />, handle: { title: 'Dashboard' } },
      { path: routePaths.devices, element: <Placeholder title="Devices" />, handle: { title: 'Devices' } },
      {
        path: routePaths.appClients,
        element: <Placeholder title="App clients" />,
        handle: { title: 'App clients' },
      },
      { path: routePaths.sites, element: <Placeholder title="Sites" />, handle: { title: 'Sites' } },
      {
        path: routePaths.registrations,
        element: <Placeholder title="Registrations" />,
        handle: { title: 'Registrations' },
      },
      {
        path: routePaths.activeCalls,
        element: <Placeholder title="Active calls" />,
        handle: { title: 'Active calls' },
      },
      { path: routePaths.audit, element: <Placeholder title="Audit" />, handle: { title: 'Audit' } },
      { path: '*', element: <NotFound />, handle: { title: 'Page not found' } },
    ],
  },
]);
