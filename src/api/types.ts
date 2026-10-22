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

/**
 * The server's registration journal of a number: online now or not, and when it was last seen either way. It
 * keeps a number that expired (unlike the core's live table), so an offline number still shows when it was online.
 */
export interface SipRegistration {
  online: boolean;
  /** Live devices right now; 0 when offline. */
  contacts: number;
  /** The device shown: the most recently refreshed contact while online, the last one seen while offline. */
  contact: string | null;
  received: string | null;
  user_agent: string | null;
  online_since: string | null;
  last_online_at: string;
  last_offline_at: string | null;
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

// ---- Dashboard ----

/** GET /dashboard?range= - the period shown; the server picks the bucket of the series from it. */
export type DashboardRange = '1h' | '6h' | '1d' | '1w' | '1m';

/** Two sums hold by construction: subscribers + panels = total = online + offline. */
export interface DashboardCounters {
  /** Enabled app client numbers, registered or not. */
  subscribers: number;
  /** Enabled panel numbers, registered or not. */
  panels: number;
  /** Every enabled number - the ceiling of both presence charts. */
  total: number;
  /** Enabled numbers registered right now. */
  online: number;
  /** Enabled numbers not registered right now. */
  offline: number;
  /** Over the selected range. */
  pushes: number;
  registrations: number;
  calls: number;
  calls_answered: number;
}

/**
 * One bucket of the charts; the fleet and presence values are null for a bucket without a sample (the server was
 * down), and where they exist subscribers + panels = total = online + offline.
 */
export interface DashboardPoint {
  at: string;
  subscribers: number | null;
  panels: number | null;
  total: number | null;
  online: number | null;
  offline: number | null;
  pushes: number;
  registrations: number;
  calls: number;
}

export interface Dashboard {
  range: DashboardRange;
  bucket_seconds: number;
  from: string;
  to: string;
  counters: DashboardCounters;
  points: DashboardPoint[];
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

// ---- Event log ----

/** The journals the event log is made of; also its `category` filter. */
export type ServerEventCategory = 'REGISTRATION' | 'CALL' | 'PUSH' | 'SERVICE_CALL';

/** The SIP account behind a number, when the number has one. */
export interface EventSipAccount {
  id: number;
  kind: SipAccountKind;
  name: string;
  external_id: string | null;
}

export type RegistrationEventKind = 'ONLINE' | 'OFFLINE';

export interface RegistrationEvent {
  username: string;
  kind: RegistrationEventKind;
  /** ONLINE only: the device that came up. */
  contact: string | null;
  received: string | null;
  user_agent: string | null;
  account: EventSipAccount | null;
}

/** How the core handled the call: rang the registered devices, or parked it and asked for a wake push. */
export type CallMode = 'RELAY' | 'WAKE';

/** RINGING until the core reports the end of the call. */
export type CallOutcome = 'RINGING' | 'ANSWERED' | 'CANCELED' | 'NO_ANSWER' | 'REJECTED' | 'FAILED';

/** One call, followed from its start to its end. */
export interface CallEvent {
  sip_call_id: string;
  mode: CallMode | null;
  caller_number: string | null;
  caller_external_id: string | null;
  caller_name: string | null;
  caller_account_id: number | null;
  callee_number: string | null;
  callee_external_id: string | null;
  callee_name: string | null;
  callee_account_id: number | null;
  started_at: string;
  answered_at: string | null;
  ended_at: string | null;
  /** bye | cancel | final | window */
  end_reason: string | null;
  /** The final SIP code the caller got. */
  end_code: number | null;
  outcome: CallOutcome;
  /**
   * WAKE only: when the callee came online, or registered a new device, while the call waited – the wake push
   * worked. Null while nobody has registered. Subscribers' registrations are not journaled otherwise.
   */
  callee_registered_at: string | null;
}

/** One wake push to the operator's backend and what came of it. */
export interface PushDelivery {
  call_id: string;
  sip_call_id: string | null;
  kind: PushDeliveryKind;
  caller_number: string | null;
  caller_external_id: string | null;
  caller_account_id: number | null;
  callee_number: string | null;
  callee_external_id: string | null;
  callee_account_id: number | null;
  url: string | null;
  outcome: PushDeliveryOutcome;
  http_status: number | null;
  attempts: number;
  duration_ms: number | null;
  response_excerpt: string | null;
  error: string | null;
}

/** TOKEN: a live token; UNKNOWN_TOKEN: wrong or revoked; NO_TOKEN: no X-SERVICE-TOKEN header. */
export type ServiceCallerAuth = 'TOKEN' | 'UNKNOWN_TOKEN' | 'NO_TOKEN';

export type ServiceCallOperation = 'READ' | 'ENSURE' | 'DISABLE' | 'REGISTRATION' | 'OTHER';

/** One call of an operator's backend to the service API. */
export interface ServiceCall {
  caller_auth: ServiceCallerAuth;
  /** The backend: the live token it presented. */
  token_id: number | null;
  token_name: string | null;
  /** First characters of a presented token-shaped value, a revoked token included. */
  token_prefix: string | null;
  method: string;
  path: string;
  operation: ServiceCallOperation;
  sip_kind: string | null;
  external_id: string | null;
  /** The number of the endpoint, when it has one. */
  username: string | null;
  account_id: number | null;
  http_status: number;
  duration_ms: number;
  remote_address: string | null;
  /** The error a refused or failed call got; never anything of a success. */
  error: string | null;
}

/** One line of the event log: exactly the body of its category is set. */
export interface ServerEvent {
  /** Unique across the whole log; `id` is unique only inside its journal. */
  key: string;
  category: ServerEventCategory;
  id: number;
  occurred_at: string;
  registration: RegistrationEvent | null;
  call: CallEvent | null;
  push: PushDelivery | null;
  service_call: ServiceCall | null;
}

/** GET /events */
export interface ServerEventPage {
  items: ServerEvent[];
  total: number;
  page: number;
  size: number;
  /** What this console user may see: readers get registrations and calls only. */
  categories: ServerEventCategory[];
}
