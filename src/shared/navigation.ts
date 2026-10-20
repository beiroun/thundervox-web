// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import {
  IconHistory,
  IconInfoCircle,
  IconLayoutDashboard,
  IconPhone,
  IconPlugConnected,
  IconUsers,
  type TablerIcon,
} from '@tabler/icons-react';

import type { ConsoleRole } from '@/api/types';
import type { Copy } from '@/i18n/dict';
import { mayManageConsoleUsers, mayViewIntegration } from '@/shared/consoleRoles';

/** Route paths of the console, one place for links and the router. */
export const routePaths = {
  login: '/login',
  dashboard: '/',
  sipAccounts: '/sip-accounts',
  consoleUsers: '/console-users',
  audit: '/audit',
  integration: '/integration',
  about: '/about',
} as const;

export type RoutePath = (typeof routePaths)[keyof typeof routePaths];

/** The card page of one SIP number. */
export const sipAccountPath = (id: number | string) => `${routePaths.sipAccounts}/${id}`;

/** The card page of one console user. */
export const consoleUserPath = (id: number | string) => `${routePaths.consoleUsers}/${id}`;

interface NavigationItem {
  path: RoutePath;
  /** Key of the label in the dictionary's `nav` block. */
  labelKey: keyof Copy['nav'];
  /**
   * Drawn before the label. The icon, not a dot, marks the active item; the choice per kind of page is the
   * 84softworks vocabulary (NewLight/84softworks-design/design.md), the same in every product console.
   */
  icon: TablerIcon;
  /** Hidden from roles the server would refuse anyway; absent = every role. */
  visibleTo?: (role: ConsoleRole) => boolean;
}

/** Navigation entries in the order they appear in the side column (and the drawer on a phone). */
export const navigationItems: ReadonlyArray<NavigationItem> = [
  { path: routePaths.dashboard, labelKey: 'dashboard', icon: IconLayoutDashboard },
  { path: routePaths.sipAccounts, labelKey: 'sipAccounts', icon: IconPhone },
  { path: routePaths.consoleUsers, labelKey: 'consoleUsers', icon: IconUsers, visibleTo: mayManageConsoleUsers },
  { path: routePaths.audit, labelKey: 'audit', icon: IconHistory },
  { path: routePaths.integration, labelKey: 'integration', icon: IconPlugConnected, visibleTo: mayViewIntegration },
  { path: routePaths.about, labelKey: 'about', icon: IconInfoCircle },
];
