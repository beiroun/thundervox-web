// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import type { ConsoleRole } from '@/api/types';
import { mayManageConsoleUsers } from '@/shared/consoleRoles';

/** Route paths of the console, one place for links and the router. */
export const routePaths = {
  login: '/login',
  dashboard: '/',
  sipAccounts: '/sip-accounts',
  consoleUsers: '/console-users',
  audit: '/audit',
} as const;

export type RoutePath = (typeof routePaths)[keyof typeof routePaths];

interface NavigationItem {
  path: RoutePath;
  label: string;
  /** Hidden from roles the server would refuse anyway; absent = every role. */
  visibleTo?: (role: ConsoleRole) => boolean;
}

/** Navigation entries in the order they appear in the sidebar. */
export const navigationItems: ReadonlyArray<NavigationItem> = [
  { path: routePaths.dashboard, label: 'Dashboard' },
  { path: routePaths.sipAccounts, label: 'SIP numbers' },
  { path: routePaths.consoleUsers, label: 'Console users', visibleTo: mayManageConsoleUsers },
  { path: routePaths.audit, label: 'Audit' },
];
