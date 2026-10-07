// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import type { ConsoleRole } from '@/api/types';
import type { Copy } from '@/i18n/dict';
import { mayManageConsoleUsers } from '@/shared/consoleRoles';

/** Route paths of the console, one place for links and the router. */
export const routePaths = {
  login: '/login',
  dashboard: '/',
  sipAccounts: '/sip-accounts',
  consoleUsers: '/console-users',
  audit: '/audit',
  about: '/about',
} as const;

export type RoutePath = (typeof routePaths)[keyof typeof routePaths];

interface NavigationItem {
  path: RoutePath;
  /** Key of the label in the dictionary's `nav` block. */
  labelKey: keyof Copy['nav'];
  /** Hidden from roles the server would refuse anyway; absent = every role. */
  visibleTo?: (role: ConsoleRole) => boolean;
}

/** Navigation entries in the order they appear in the header band (and the mobile drawer). */
export const navigationItems: ReadonlyArray<NavigationItem> = [
  { path: routePaths.dashboard, labelKey: 'dashboard' },
  { path: routePaths.sipAccounts, labelKey: 'sipAccounts' },
  { path: routePaths.consoleUsers, labelKey: 'consoleUsers', visibleTo: mayManageConsoleUsers },
  { path: routePaths.audit, labelKey: 'audit' },
  { path: routePaths.about, labelKey: 'about' },
];
