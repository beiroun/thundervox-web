// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.

/** Route paths of the console, one place for links and the router. */
export const routePaths = {
  dashboard: '/',
  devices: '/devices',
  appClients: '/app-clients',
  sites: '/sites',
  registrations: '/registrations',
  activeCalls: '/calls',
  audit: '/audit',
} as const;

export type RoutePath = (typeof routePaths)[keyof typeof routePaths];

/** Navigation entries in the order they appear in the sidebar. */
export const navigationItems: ReadonlyArray<{ path: RoutePath; label: string }> = [
  { path: routePaths.dashboard, label: 'Dashboard' },
  { path: routePaths.devices, label: 'Devices' },
  { path: routePaths.appClients, label: 'App clients' },
  { path: routePaths.sites, label: 'Sites' },
  { path: routePaths.registrations, label: 'Registrations' },
  { path: routePaths.activeCalls, label: 'Active calls' },
  { path: routePaths.audit, label: 'Audit' },
];
