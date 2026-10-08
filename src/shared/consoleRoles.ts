// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import type { ConsoleRole } from '@/api/types';

/**
 * What each console role may do - the same rules the server enforces (ConsoleRole.mayManage, SecurityConfig).
 * The console only hides what would be refused anyway; the server stays the authority.
 */

/** Every role, highest first - the order of the legend. */
export const consoleRoles: ReadonlyArray<ConsoleRole> = ['SUPER_ADMINISTRATOR', 'ADMINISTRATOR', 'READER'];

/** Language-invariant short form shown in badges; the full names are in the dictionary and the legend. */
export const consoleRoleAbbreviations: Record<ConsoleRole, string> = {
  SUPER_ADMINISTRATOR: 'SA',
  ADMINISTRATOR: 'ADM',
  READER: 'RD',
};

/** Brand palette: the super administrator in the accent, administrators in the navy, readers neutral. */
export const consoleRoleColors: Record<ConsoleRole, string> = {
  SUPER_ADMINISTRATOR: 'accent',
  ADMINISTRATOR: 'brand',
  READER: 'gray',
};

/** Creating, renaming, re-keying, blocking and deleting SIP numbers. */
export function mayChangeSipAccounts(role: ConsoleRole): boolean {
  return role !== 'READER';
}

/** Roles a user with [role] may create and manage: administrators manage readers, the super administrator both. */
export function manageableRoles(role: ConsoleRole): ConsoleRole[] {
  switch (role) {
    case 'SUPER_ADMINISTRATOR':
      return ['READER', 'ADMINISTRATOR'];
    case 'ADMINISTRATOR':
      return ['READER'];
    case 'READER':
      return [];
  }
}

export function mayManageConsoleUsers(role: ConsoleRole): boolean {
  return manageableRoles(role).length > 0;
}

/** The Integration page: administrators read it and send test pushes, readers never see it. */
export function mayViewIntegration(role: ConsoleRole): boolean {
  return role !== 'READER';
}

/** Issuing and revoking service tokens, changing the push settings. */
export function mayChangeIntegration(role: ConsoleRole): boolean {
  return role === 'SUPER_ADMINISTRATOR';
}
