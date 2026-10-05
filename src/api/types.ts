// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
//
// Contract of thundervox-server, written by hand from its controllers until `npm run update-types` can run against
// a live server (src/api/generated/openapi.ts). Field names are the server's snake_case JSON. Timestamps are the
// server's local time without an offset (the server runs in Asia/Omsk) and are shown as they come.

/** Every server response: success carries data with message "OK", failure carries error with message "FAIL". */
export interface BaseApiResponse<T> {
  data: T | null;
  message: 'OK' | 'FAIL' | string;
  error: FieldErrorDto | null;
}

/** message is technical, localizedMessage is what the operator should read. */
export interface FieldErrorDto {
  message: string;
  localizedMessage: string;
}

/** GET /info */
export interface PlatformInfo {
  name: string;
  version: string;
  license: string;
}

// ---- Console access ----

export type ConsoleRole = 'READER' | 'ADMINISTRATOR' | 'SUPER_ADMINISTRATOR';

export interface ConsoleUser {
  id: number;
  login: string;
  role: ConsoleRole;
  enabled: boolean;
  created_at: string;
  password_changed_at: string;
  /** The super administrator: defined by the server's environment, never editable from the console. */
  managed_by_environment: boolean;
}

/** POST /auth/login */
export interface LoginRequest {
  login: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expires_at: string;
  user: ConsoleUser;
}

/** POST /console-users */
export interface CreateConsoleUserRequest {
  login: string;
  role: ConsoleRole;
  /** Omitted: the server generates one and returns it once. */
  password?: string;
}

/** PUT /console-users/{id}: only the fields present change. */
export interface UpdateConsoleUserRequest {
  role?: ConsoleRole;
  enabled?: boolean;
}

export interface ConsoleUserCredentials {
  user: ConsoleUser;
  generated_password: string | null;
}

// ---- SIP numbers ----

export type SipAccountKind = 'PANEL' | 'CLIENT';

export interface SipRegistration {
  online: boolean;
  contact: string;
  received: string | null;
  user_agent: string;
  expires_at: string;
  last_seen_at: string;
}

export interface SipAccount {
  id: number;
  /** The number itself: what the device registers as and what a panel dials. */
  username: string;
  name: string;
  kind: SipAccountKind;
  enabled: boolean;
  created_at: string;
  password_rotated_at: string;
  registration: SipRegistration | null;
}

/** POST /sip-accounts */
export interface CreateSipAccountRequest {
  kind: SipAccountKind;
  name: string;
  /** Omitted: the server generates the next number of the kind. */
  username?: string;
  /** Omitted: the server generates one and returns it once. */
  password?: string;
}

export interface SipAccountCredentials {
  account: SipAccount;
  /** SIP domain = digest realm, entered on the device next to the number and the password. */
  realm: string;
  generated_password: string | null;
}

// ---- Audit ----

export interface AuditEntry {
  id: number;
  created_at: string;
  actor_type: 'ADMIN' | 'SERVICE' | 'SYSTEM' | string;
  actor_login: string;
  action: string;
  target_type: string;
  target_id: number | null;
  details: unknown;
}

export interface AuditPage {
  items: AuditEntry[];
  total: number;
  page: number;
  size: number;
}
