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
  /** Human label, never a key. */
  name: string;
  /**
   * The endpoint's id in the operator's own system - the key the service API finds the number by. Panel: the
   * device id (Modus: "ip:port", which video to show when it calls); app client: the subscriber account (whom to
   * wake with a push). null for test numbers made by hand.
   */
  external_id: string | null;
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
  /** Omitted: a test number without an id in the operator's system. */
  external_id?: string;
  /** Omitted: the server generates the next number of the kind. */
  username?: string;
  /** Omitted: the server generates one and returns it once. */
  password?: string;
}

/** PUT /sip-accounts/{id}: name and external id; the number itself never changes. Empty external_id clears it. */
export interface UpdateSipAccountDetailsRequest {
  name: string;
  external_id?: string | null;
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

// ---- Integration ----

/** A named token of the service API; the value exists only in the response that issued it. */
export interface ServiceToken {
  id: number;
  name: string;
  /** First characters of the value, to recognise it in a config file. */
  token_prefix: string;
  enabled: boolean;
  created_by: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

/** POST /integration/tokens */
export interface IssueServiceTokenRequest {
  name: string;
}

export interface IssuedServiceToken {
  token: ServiceToken;
  /** Shown once; the server keeps only its hash. */
  value: string;
}

/** Where the wake push goes; the header value is write-only. */
export interface PushSettings {
  enabled: boolean;
  url: string;
  auth_header_name: string;
  auth_header_value_set: boolean;
  /** Last characters of the stored value, or null. */
  auth_header_value_hint: string | null;
  connect_timeout_ms: number;
  read_timeout_ms: number;
  updated_at: string;
  updated_by: string | null;
}

/** PUT /integration/push: auth_header_value absent = keep the stored secret, empty string = clear it. */
export interface UpdatePushSettingsRequest {
  enabled: boolean;
  url: string;
  auth_header_name: string;
  auth_header_value?: string;
  connect_timeout_ms: number;
  read_timeout_ms: number;
}

/** GET /integration */
export interface IntegrationOverview {
  /** Address the operator's backend reaches the server at; empty when the deployment did not say. */
  api_base_url: string;
  sip_domain: string;
  push: PushSettings;
}

export type PushDeliveryKind = 'LIVE' | 'TEST';

export type PushDeliveryOutcome = 'DELIVERED' | 'REJECTED' | 'FAILED' | 'SKIPPED';

/** POST /integration/push/test */
export interface PushTestRequest {
  caller_username: string;
  callee_username: string;
}

export interface PushTestResult {
  call_id: string;
  url: string;
  outcome: PushDeliveryOutcome;
  http_status: number | null;
  attempts: number;
  duration_ms: number;
  response_excerpt: string | null;
  error: string | null;
  /** The JSON that was sent: the contract filled in with real values. */
  sent_body: string;
}

export interface PushDelivery {
  id: number;
  created_at: string;
  call_id: string;
  sip_call_id: string | null;
  kind: PushDeliveryKind;
  caller_number: string | null;
  caller_external_id: string | null;
  callee_number: string | null;
  callee_external_id: string | null;
  url: string | null;
  outcome: PushDeliveryOutcome;
  http_status: number | null;
  attempts: number;
  duration_ms: number | null;
  response_excerpt: string | null;
  error: string | null;
}

export interface PushDeliveryPage {
  items: PushDelivery[];
  total: number;
  page: number;
  size: number;
}
