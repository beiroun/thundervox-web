// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
//
// Mock of thundervox-server for `npm run dev:mock`: the Vite dev server answers /api/v1 itself from in-memory
// sample data, so the console can be browsed without a server, a database or a core. State lives for the life of
// the dev server (restart = fresh data). Status codes, envelopes and localized messages follow the real server
// (ApiException: 511 wrong input, 410 not found, 413 insufficient privileges; 401 without a session), so what the
// console shows here is what it shows against the real thing.
//
// Logins: admin / admin (super administrator), operator / operator (administrator), viewer / viewer (reader).
import type { ServerResponse } from 'node:http';
import type { Connect, Plugin } from 'vite';

import type {
  AuditEntry,
  AuditPage,
  BaseApiResponse,
  ConsoleRole,
  ConsoleUser,
  ConsoleUserCredentials,
  CreateConsoleUserRequest,
  CreateSipAccountRequest,
  LoginRequest,
  LoginResponse,
  PlatformInfo,
  SipAccount,
  SipAccountCredentials,
  SipAccountKind,
  UpdateConsoleUserRequest,
  UpdateSipAccountDetailsRequest,
} from '../src/api/types.ts';

const apiPrefix = '/api/v1';
const latencyMs = 120;
const realm = 'sip.thundervox.ru';
const sessionLifetimeMs = 8 * 60 * 60 * 1000;

const wrongInputStatus = 511;
const notFoundStatus = 410;
const insufficientPrivilegesStatus = 413;

/** An error the real server would answer with: status plus the technical and the operator-facing message. */
class ApiFailure extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly localizedMessage: string,
  ) {
    super(message);
  }
}

interface MockConsoleUser extends ConsoleUser {
  password: string;
}

interface MockState {
  users: MockConsoleUser[];
  accounts: SipAccount[];
  audit: AuditEntry[];
  /** Bearer token -> login; dropped on password reset, as the real server invalidates the tokens. */
  sessions: Map<string, string>;
  nextUserId: number;
  nextAccountId: number;
  nextAuditId: number;
}

// ---- Time and tokens ----

/** Server-local time without an offset, the way thundervox-server serializes timestamps. */
function serverTime(date: Date = new Date()): string {
  const two = (value: number) => String(value).padStart(2, '0');
  return (
    `${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())}` +
    `T${two(date.getHours())}:${two(date.getMinutes())}:${two(date.getSeconds())}` +
    `.${String(date.getMilliseconds()).padStart(3, '0')}000`
  );
}

function minutesAgo(minutes: number): string {
  return serverTime(new Date(Date.now() - minutes * 60_000));
}

function base64Url(value: string): string {
  return Buffer.from(value).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Unsigned JWT-shaped token: the console reads only the `exp` claim, and the mock looks the token up itself. */
function issueToken(login: string, expiresAtMs: number): string {
  return `${base64Url('{"alg":"none","typ":"JWT"}')}.${base64Url(JSON.stringify({ sub: login, exp: Math.floor(expiresAtMs / 1000) }))}.mock`;
}

const passwordAlphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!#$%&*+-=?@_';

function generatePassword(length = 16): string {
  let password = '';
  for (let index = 0; index < length; index += 1) {
    password += passwordAlphabet[Math.floor(Math.random() * passwordAlphabet.length)];
  }
  return password;
}

// ---- Sample data ----

function createState(): MockState {
  const users: MockConsoleUser[] = [
    {
      id: 1,
      login: 'admin',
      password: 'admin',
      role: 'SUPER_ADMINISTRATOR',
      enabled: true,
      created_at: minutesAgo(3 * 24 * 60),
      password_changed_at: minutesAgo(3 * 24 * 60),
      managed_by_environment: true,
    },
    {
      id: 2,
      login: 'operator',
      password: 'operator',
      role: 'ADMINISTRATOR',
      enabled: true,
      created_at: minutesAgo(2 * 24 * 60),
      password_changed_at: minutesAgo(2 * 24 * 60),
      managed_by_environment: false,
    },
    {
      id: 3,
      login: 'viewer',
      password: 'viewer',
      role: 'READER',
      enabled: true,
      created_at: minutesAgo(26 * 60),
      password_changed_at: minutesAgo(26 * 60),
      managed_by_environment: false,
    },
    {
      id: 4,
      login: 'night.shift',
      password: 'night.shift',
      role: 'READER',
      enabled: false,
      created_at: minutesAgo(20 * 60),
      password_changed_at: minutesAgo(5 * 60),
      managed_by_environment: false,
    },
  ];

  const accounts: SipAccount[] = [
    {
      id: 1,
      username: '20000001',
      name: 'Подъезд 1, Маяковского 14',
      external_id: '178.74.67.30:5060',
      kind: 'PANEL',
      enabled: true,
      created_at: minutesAgo(2 * 24 * 60),
      password_rotated_at: minutesAgo(2 * 24 * 60),
      registration: {
        online: true,
        contact: 'sip:20000001@178.74.67.30:5060',
        received: '178.74.67.30:5060',
        user_agent: 'Beward DKS15122 v3.5.6',
        expires_at: serverTime(new Date(Date.now() + 5 * 60_000)),
        last_seen_at: minutesAgo(1),
      },
    },
    {
      id: 2,
      username: '20000002',
      name: 'Подъезд 2, Маяковского 14',
      external_id: '178.74.67.31:5060',
      kind: 'PANEL',
      enabled: true,
      created_at: minutesAgo(2 * 24 * 60),
      password_rotated_at: minutesAgo(2 * 24 * 60),
      registration: {
        online: false,
        contact: 'sip:20000002@178.74.67.31:5060',
        received: '178.74.67.31:5060',
        user_agent: 'Beward DKS15122 v3.5.6',
        expires_at: minutesAgo(40),
        last_seen_at: minutesAgo(45),
      },
    },
    {
      id: 3,
      username: '10000001',
      name: 'Андрей, кв. 11',
      external_id: '0001234567',
      kind: 'CLIENT',
      enabled: true,
      created_at: minutesAgo(24 * 60),
      password_rotated_at: minutesAgo(24 * 60),
      registration: {
        online: true,
        contact: 'sip:10000001@10.0.0.5:52311',
        received: '93.100.12.7:52311',
        user_agent: 'Zoiper v2.10.20',
        expires_at: serverTime(new Date(Date.now() + 3 * 60_000)),
        last_seen_at: minutesAgo(2),
      },
    },
    {
      id: 4,
      username: '10000002',
      name: 'Мария, кв. 12',
      external_id: '0001234568',
      kind: 'CLIENT',
      enabled: true,
      created_at: minutesAgo(23 * 60),
      password_rotated_at: minutesAgo(23 * 60),
      registration: null,
    },
    {
      id: 5,
      username: '20000003',
      name: 'Test panel',
      external_id: null,
      kind: 'PANEL',
      enabled: false,
      created_at: minutesAgo(10 * 60),
      password_rotated_at: minutesAgo(10 * 60),
      registration: null,
    },
  ];

  const audit: AuditEntry[] = [
    entry(1, minutesAgo(3 * 24 * 60), 'SYSTEM', 'system', 'SUPER_ADMINISTRATOR_SYNCED', 'CONSOLE_USER', 1, null),
    entry(2, minutesAgo(2 * 24 * 60 + 5), 'ADMIN', 'admin', 'CONSOLE_USER_CREATED', 'CONSOLE_USER', 2, { login: 'operator', role: 'ADMINISTRATOR' }),
    entry(3, minutesAgo(2 * 24 * 60), 'ADMIN', 'operator', 'SIP_ACCOUNT_CREATED', 'SIP_ACCOUNT', 1, { username: '20000001', kind: 'PANEL', external_id: '178.74.67.30:5060' }),
    entry(4, minutesAgo(2 * 24 * 60 - 3), 'ADMIN', 'operator', 'SIP_ACCOUNT_CREATED', 'SIP_ACCOUNT', 2, { username: '20000002', kind: 'PANEL', external_id: '178.74.67.31:5060' }),
    entry(5, minutesAgo(24 * 60), 'SERVICE', 'modus', 'SIP_ACCOUNT_CREATED', 'SIP_ACCOUNT', 3, { username: '10000001', kind: 'CLIENT', external_id: '0001234567' }),
    entry(6, minutesAgo(23 * 60), 'SERVICE', 'modus', 'SIP_ACCOUNT_CREATED', 'SIP_ACCOUNT', 4, { username: '10000002', kind: 'CLIENT', external_id: '0001234568' }),
    entry(7, minutesAgo(10 * 60), 'ADMIN', 'admin', 'SIP_ACCOUNT_CREATED', 'SIP_ACCOUNT', 5, { username: '20000003', kind: 'PANEL' }),
    entry(8, minutesAgo(9 * 60), 'ADMIN', 'admin', 'SIP_ACCOUNT_BLOCKED', 'SIP_ACCOUNT', 5, { username: '20000003' }),
    entry(9, minutesAgo(5 * 60), 'ADMIN', 'admin', 'CONSOLE_USER_PASSWORD_RESET', 'CONSOLE_USER', 4, { login: 'night.shift' }),
    entry(10, minutesAgo(4 * 60), 'ADMIN', 'admin', 'CONSOLE_USER_UPDATED', 'CONSOLE_USER', 4, { login: 'night.shift', enabled: false }),
  ];

  return { users, accounts, audit, sessions: new Map(), nextUserId: 5, nextAccountId: 6, nextAuditId: 11 };
}

function entry(
  id: number,
  createdAt: string,
  actorType: AuditEntry['actor_type'],
  actorLogin: string,
  action: string,
  targetType: string,
  targetId: number | null,
  details: unknown,
): AuditEntry {
  return { id, created_at: createdAt, actor_type: actorType, actor_login: actorLogin, action, target_type: targetType, target_id: targetId, details };
}

// ---- Rules shared with the server (SipAccountInputRules, ConsoleUserInputRules, ConsoleRole.mayManage) ----

const numberPattern = /^[0-9]{2,16}$/;
const externalIdPattern = /^[A-Za-z0-9._:-]{1,128}$/;
const sipPasswordPattern = /^[\x21-\x7E]{8,64}$/;
const loginPattern = /^[A-Za-z0-9._-]{3,64}$/;

function manageableRoles(role: ConsoleRole): ConsoleRole[] {
  switch (role) {
    case 'SUPER_ADMINISTRATOR':
      return ['READER', 'ADMINISTRATOR'];
    case 'ADMINISTRATOR':
      return ['READER'];
    case 'READER':
      return [];
  }
}

function requireAdministrator(actor: ConsoleUser): void {
  if (actor.role === 'READER') {
    throw new ApiFailure(insufficientPrivilegesStatus, `${actor.login} (READER) may not change anything`, 'Недостаточно прав для этого действия');
  }
}

function requireValidName(name: unknown): string {
  const trimmed = typeof name === 'string' ? name.trim() : '';
  if (trimmed.length === 0 || trimmed.length > 128) {
    throw new ApiFailure(wrongInputStatus, 'SIP account name is empty or too long', 'Название: от 1 до 128 символов');
  }
  return trimmed;
}

function requireValidExternalId(externalId: string): string {
  const trimmed = externalId.trim();
  if (!externalIdPattern.test(trimmed)) {
    throw new ApiFailure(
      wrongInputStatus,
      `External id '${trimmed}' does not match ${externalIdPattern}`,
      "Внешний id: от 1 до 128 символов – латинские буквы, цифры, '.', '_', ':' или '-'",
    );
  }
  return trimmed;
}

function requireValidSipPassword(password: string): string {
  if (!sipPasswordPattern.test(password)) {
    throw new ApiFailure(wrongInputStatus, 'SIP password does not match the rules', 'Пароль: от 8 до 64 символов, латиница, цифры и знаки, без пробелов');
  }
  return password;
}

function requireValidConsolePassword(password: string): string {
  if (password.length < 10 || password.length > 128 || /\s/.test(password)) {
    throw new ApiFailure(wrongInputStatus, 'Console password does not match the rules', 'Пароль: от 10 до 128 символов, без пробелов');
  }
  return password;
}

// ---- Handlers ----

type Handler = (context: RequestContext) => unknown | Promise<unknown>;

interface Route {
  method: string;
  pattern: RegExp;
  /** Public routes need no session; the rest answer 401 without one. */
  isPublic?: boolean;
  handle: Handler;
}

interface RequestContext {
  state: MockState;
  params: string[];
  query: URLSearchParams;
  body: Record<string, unknown>;
  /** The operator behind the bearer token; set for every non-public route. */
  actor: MockConsoleUser;
}

function findUserOrFail(state: MockState, id: number): MockConsoleUser {
  const user = state.users.find((candidate) => candidate.id === id);
  if (!user) {
    throw new ApiFailure(notFoundStatus, `Console user ${id} not found`, 'Пользователь не найден');
  }
  return user;
}

function findAccountOrFail(state: MockState, id: number): SipAccount {
  const account = state.accounts.find((candidate) => candidate.id === id);
  if (!account) {
    throw new ApiFailure(notFoundStatus, `SIP account ${id} not found`, 'Номер не найден');
  }
  return account;
}

function publicUser(user: MockConsoleUser): ConsoleUser {
  const { password: _password, ...rest } = user;
  return rest;
}

function record(state: MockState, actor: ConsoleUser, action: string, targetType: string, targetId: number, details: unknown): void {
  state.audit.push(entry(state.nextAuditId, serverTime(), 'ADMIN', actor.login, action, targetType, targetId, details));
  state.nextAuditId += 1;
}

/** Next free number of the kind, as the server does it: 8 digits, first digit = kind. */
function nextFreeNumber(state: MockState, kind: SipAccountKind): string {
  const prefix = kind === 'PANEL' ? '2' : '1';
  const taken = new Set(state.accounts.map((account) => account.username));
  for (let suffix = 1; suffix < 10_000_000; suffix += 1) {
    const candidate = prefix + String(suffix).padStart(7, '0');
    if (!taken.has(candidate)) {
      return candidate;
    }
  }
  throw new ApiFailure(wrongInputStatus, 'No free number left', 'Свободных номеров не осталось');
}

const routes: Route[] = [
  {
    method: 'GET',
    pattern: /^\/info$/,
    isPublic: true,
    handle: (): PlatformInfo => ({ name: 'thundervox-server', version: 'mock', license: 'BUSL-1.1' }),
  },
  {
    method: 'POST',
    pattern: /^\/auth\/login$/,
    isPublic: true,
    handle: ({ state, body }): LoginResponse => {
      const { login, password } = body as Partial<LoginRequest>;
      const user = state.users.find((candidate) => candidate.login === String(login ?? '').trim());
      if (!user || user.password !== password || !user.enabled) {
        throw new ApiFailure(insufficientPrivilegesStatus, `Console login failed for '${String(login)}'`, 'Неверный логин или пароль');
      }
      const expiresAtMs = Date.now() + sessionLifetimeMs;
      const token = issueToken(user.login, expiresAtMs);
      state.sessions.set(token, user.login);
      return { token, expires_at: serverTime(new Date(expiresAtMs)), user: publicUser(user) };
    },
  },
  {
    method: 'GET',
    pattern: /^\/auth\/me$/,
    handle: ({ actor }): ConsoleUser => publicUser(actor),
  },

  // ---- SIP numbers ----
  {
    method: 'GET',
    pattern: /^\/sip-accounts$/,
    handle: ({ state }): SipAccount[] => state.accounts,
  },
  {
    method: 'POST',
    pattern: /^\/sip-accounts$/,
    handle: ({ state, actor, body }): SipAccountCredentials => {
      requireAdministrator(actor);
      const request = body as Partial<CreateSipAccountRequest>;
      const kind: SipAccountKind = request.kind === 'CLIENT' ? 'CLIENT' : 'PANEL';
      const name = requireValidName(request.name);
      const externalId = request.external_id ? requireValidExternalId(request.external_id) : null;
      const username = request.username ? request.username.trim() : nextFreeNumber(state, kind);
      if (!numberPattern.test(username)) {
        throw new ApiFailure(wrongInputStatus, `SIP number '${username}' does not match ${numberPattern}`, 'Номер: только цифры, от 2 до 16');
      }
      if (state.accounts.some((account) => account.username === username)) {
        throw new ApiFailure(wrongInputStatus, `SIP number ${username} is taken`, `Номер ${username} уже занят`);
      }
      if (externalId && state.accounts.some((account) => account.kind === kind && account.external_id === externalId)) {
        throw new ApiFailure(wrongInputStatus, `External id ${externalId} is already bound`, `Внешний id ${externalId} уже привязан к другому номеру этого типа`);
      }
      const generatedPassword = request.password ? null : generatePassword();
      if (request.password) {
        requireValidSipPassword(request.password);
      }
      const now = serverTime();
      const account: SipAccount = {
        id: state.nextAccountId,
        username,
        name,
        external_id: externalId,
        kind,
        enabled: true,
        created_at: now,
        password_rotated_at: now,
        registration: null,
      };
      state.nextAccountId += 1;
      state.accounts.push(account);
      record(state, actor, 'SIP_ACCOUNT_CREATED', 'SIP_ACCOUNT', account.id, { username, kind, ...(externalId ? { external_id: externalId } : {}) });
      return { account, realm, generated_password: generatedPassword };
    },
  },
  {
    method: 'PUT',
    pattern: /^\/sip-accounts\/(\d+)$/,
    handle: ({ state, actor, params, body }): SipAccount => {
      requireAdministrator(actor);
      const account = findAccountOrFail(state, Number(params[0]));
      const request = body as Partial<UpdateSipAccountDetailsRequest>;
      const name = requireValidName(request.name);
      const externalId = request.external_id ? requireValidExternalId(request.external_id) : null;
      if (externalId && state.accounts.some((other) => other.id !== account.id && other.kind === account.kind && other.external_id === externalId)) {
        throw new ApiFailure(wrongInputStatus, `External id ${externalId} is already bound`, `Внешний id ${externalId} уже привязан к другому номеру этого типа`);
      }
      account.name = name;
      account.external_id = externalId;
      record(state, actor, 'SIP_ACCOUNT_RENAMED', 'SIP_ACCOUNT', account.id, { username: account.username, name, external_id: externalId });
      return account;
    },
  },
  {
    method: 'POST',
    pattern: /^\/sip-accounts\/(\d+)\/password$/,
    handle: ({ state, actor, params, body }): SipAccountCredentials => {
      requireAdministrator(actor);
      const account = findAccountOrFail(state, Number(params[0]));
      const typed = typeof body.password === 'string' ? body.password : null;
      if (typed) {
        requireValidSipPassword(typed);
      }
      account.password_rotated_at = serverTime();
      record(state, actor, 'SIP_ACCOUNT_PASSWORD_ROTATED', 'SIP_ACCOUNT', account.id, { username: account.username });
      return { account, realm, generated_password: typed ? null : generatePassword() };
    },
  },
  {
    method: 'POST',
    pattern: /^\/sip-accounts\/(\d+)\/(block|unblock)$/,
    handle: ({ state, actor, params }): SipAccount => {
      requireAdministrator(actor);
      const account = findAccountOrFail(state, Number(params[0]));
      const blocked = params[1] === 'block';
      account.enabled = !blocked;
      record(state, actor, blocked ? 'SIP_ACCOUNT_BLOCKED' : 'SIP_ACCOUNT_UNBLOCKED', 'SIP_ACCOUNT', account.id, { username: account.username });
      return account;
    },
  },
  {
    method: 'DELETE',
    pattern: /^\/sip-accounts\/(\d+)$/,
    handle: ({ state, actor, params }): boolean => {
      requireAdministrator(actor);
      const account = findAccountOrFail(state, Number(params[0]));
      state.accounts = state.accounts.filter((candidate) => candidate.id !== account.id);
      record(state, actor, 'SIP_ACCOUNT_DELETED', 'SIP_ACCOUNT', account.id, { username: account.username });
      return true;
    },
  },

  // ---- Console users ----
  {
    method: 'GET',
    pattern: /^\/console-users$/,
    handle: ({ state, actor }): ConsoleUser[] => {
      requireAdministrator(actor);
      return state.users.map(publicUser);
    },
  },
  {
    method: 'POST',
    pattern: /^\/console-users$/,
    handle: ({ state, actor, body }): ConsoleUserCredentials => {
      const request = body as Partial<CreateConsoleUserRequest>;
      const login = String(request.login ?? '').trim();
      const role = request.role;
      if (!role || !manageableRoles(actor.role).includes(role)) {
        throw new ApiFailure(insufficientPrivilegesStatus, `${actor.login} (${actor.role}) may not grant ${String(role)}`, 'Недостаточно прав, чтобы назначить эту роль');
      }
      if (!loginPattern.test(login)) {
        throw new ApiFailure(wrongInputStatus, `Console login '${login}' does not match ${loginPattern}`, "Логин: от 3 до 64 символов – латинские буквы, цифры, '.', '_' или '-'");
      }
      if (state.users.some((user) => user.login === login)) {
        throw new ApiFailure(wrongInputStatus, `Console login '${login}' is taken`, `Логин «${login}» уже занят`);
      }
      const generatedPassword = request.password ? null : generatePassword(14);
      const password = request.password ? requireValidConsolePassword(request.password) : generatedPassword!;
      const now = serverTime();
      const user: MockConsoleUser = {
        id: state.nextUserId,
        login,
        password,
        role,
        enabled: true,
        created_at: now,
        password_changed_at: now,
        managed_by_environment: false,
      };
      state.nextUserId += 1;
      state.users.push(user);
      record(state, actor, 'CONSOLE_USER_CREATED', 'CONSOLE_USER', user.id, { login, role });
      return { user: publicUser(user), generated_password: generatedPassword };
    },
  },
  {
    method: 'PUT',
    pattern: /^\/console-users\/(\d+)$/,
    handle: ({ state, actor, params, body }): ConsoleUser => {
      const user = findUserOrFail(state, Number(params[0]));
      const request = body as Partial<UpdateConsoleUserRequest>;
      if (user.managed_by_environment) {
        throw new ApiFailure(wrongInputStatus, 'The super administrator is defined by the environment', 'Суперадминистратор задаётся в окружении сервера и через консоль не меняется');
      }
      if (!manageableRoles(actor.role).includes(user.role) || (request.role && !manageableRoles(actor.role).includes(request.role))) {
        throw new ApiFailure(insufficientPrivilegesStatus, `${actor.login} (${actor.role}) may not manage ${user.login}`, 'Недостаточно прав для этого действия');
      }
      if (request.role) {
        user.role = request.role;
      }
      if (typeof request.enabled === 'boolean') {
        user.enabled = request.enabled;
        if (!request.enabled) {
          dropSessionsOf(state, user.login);
        }
      }
      record(state, actor, 'CONSOLE_USER_UPDATED', 'CONSOLE_USER', user.id, { login: user.login, ...request });
      return publicUser(user);
    },
  },
  {
    method: 'POST',
    pattern: /^\/console-users\/(\d+)\/password$/,
    handle: ({ state, actor, params, body }): ConsoleUserCredentials => {
      const user = findUserOrFail(state, Number(params[0]));
      if (user.managed_by_environment || !manageableRoles(actor.role).includes(user.role)) {
        throw new ApiFailure(insufficientPrivilegesStatus, `${actor.login} (${actor.role}) may not manage ${user.login}`, 'Недостаточно прав для этого действия');
      }
      const typed = typeof body.password === 'string' ? requireValidConsolePassword(body.password) : null;
      const generatedPassword = typed ? null : generatePassword(14);
      user.password = typed ?? generatedPassword!;
      user.password_changed_at = serverTime();
      // Every session of that user ends with the password, as on the real server
      dropSessionsOf(state, user.login);
      record(state, actor, 'CONSOLE_USER_PASSWORD_RESET', 'CONSOLE_USER', user.id, { login: user.login });
      return { user: publicUser(user), generated_password: generatedPassword };
    },
  },

  // ---- Audit ----
  {
    method: 'GET',
    pattern: /^\/audit$/,
    handle: ({ state, query }): AuditPage => {
      const page = Math.max(0, Number(query.get('page') ?? 0));
      const size = Math.min(200, Math.max(1, Number(query.get('size') ?? 50)));
      const newestFirst = [...state.audit].reverse();
      return { items: newestFirst.slice(page * size, page * size + size), total: newestFirst.length, page, size };
    },
  },
];

function dropSessionsOf(state: MockState, login: string): void {
  for (const [token, holder] of state.sessions) {
    if (holder === login) {
      state.sessions.delete(token);
    }
  }
}

/** The app client's registration comes and goes every 45 s, so the polling and the online badge show life. */
function refreshLiveState(state: MockState): void {
  const client = state.accounts.find((account) => account.username === '10000001');
  if (client?.registration) {
    const online = Math.floor(Date.now() / 45_000) % 2 === 0;
    client.registration.online = online;
    if (online) {
      client.registration.last_seen_at = serverTime();
      client.registration.expires_at = serverTime(new Date(Date.now() + 3 * 60_000));
    }
  }
}

// ---- HTTP plumbing ----

function readBody(req: Connect.IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8').trim();
      if (raw === '') {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw) as Record<string, unknown>);
      } catch {
        reject(new ApiFailure(wrongInputStatus, 'Request body is not JSON', 'Тело запроса не разобрано'));
      }
    });
    req.on('error', reject);
  });
}

function send(res: ServerResponse, status: number, envelope: BaseApiResponse<unknown>): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(envelope));
}

function sendFailure(res: ServerResponse, failure: ApiFailure): void {
  send(res, failure.status, { data: null, message: 'FAIL', error: { message: failure.message, localizedMessage: failure.localizedMessage } });
}

function resolveActor(state: MockState, req: Connect.IncomingMessage): MockConsoleUser {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : '';
  const login = state.sessions.get(token);
  const user = login ? state.users.find((candidate) => candidate.login === login) : undefined;
  if (!user || !user.enabled) {
    throw new ApiFailure(401, 'Authentication required', 'Войдите в консоль');
  }
  return user;
}

export function mockApiPlugin(): Plugin {
  const state = createState();

  return {
    name: 'thundervox-mock-api',
    apply: 'serve',
    configureServer(server) {
      server.config.logger.info(
        `  ➜  mock API on ${apiPrefix} - logins: admin/admin (SA), operator/operator (ADM), viewer/viewer (RD)`,
      );

      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith(`${apiPrefix}/`)) {
          next();
          return;
        }
        void handle(req, res);
      });
    },
  };

  async function handle(req: Connect.IncomingMessage, res: ServerResponse): Promise<void> {
    const url = new URL(req.url ?? '/', 'http://mock');
    const path = url.pathname.slice(apiPrefix.length);
    const method = (req.method ?? 'GET').toUpperCase();

    await new Promise((resolve) => setTimeout(resolve, latencyMs));

    try {
      const route = routes.find((candidate) => candidate.method === method && candidate.pattern.test(path));
      if (!route) {
        throw new ApiFailure(404, `No route for ${method} ${path}`, 'Нет такого метода');
      }
      refreshLiveState(state);
      const params = route.pattern.exec(path)?.slice(1) ?? [];
      const body = method === 'GET' || method === 'DELETE' ? {} : await readBody(req);
      const context: RequestContext = {
        state,
        params,
        query: url.searchParams,
        body,
        // Public routes never read the actor; the placeholder keeps the context shape uniform
        actor: route.isPublic ? (state.users[0] as MockConsoleUser) : resolveActor(state, req),
      };
      const data = await route.handle(context);
      send(res, 200, { data, message: 'OK', error: null });
    } catch (error) {
      if (error instanceof ApiFailure) {
        sendFailure(res, error);
        return;
      }
      server_error(res, error);
    }
  }
}

function server_error(res: ServerResponse, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  send(res, 500, { data: null, message: 'FAIL', error: { message, localizedMessage: 'Внутренняя ошибка мока' } });
}
