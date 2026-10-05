// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import type { ConsoleRole } from '@/api/types';

/**
 * What each console role may do - the same rules the server enforces (ConsoleRole.mayManage, SecurityConfig).
 * The console only hides what would be refused anyway; the server stays the authority.
 */
export const consoleRoleTitles: Record<ConsoleRole, string> = {
  READER: 'Reader',
  ADMINISTRATOR: 'Administrator',
  SUPER_ADMINISTRATOR: 'Super administrator',
};

export const consoleRoleColors: Record<ConsoleRole, string> = {
  READER: 'gray',
  ADMINISTRATOR: 'blue',
  SUPER_ADMINISTRATOR: 'grape',
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
