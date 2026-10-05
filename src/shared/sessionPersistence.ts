// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import type { ConsoleUser } from '@/api/types';

/** What survives a page reload: the bearer token and the user it was issued to. */
export interface StoredSession {
  token: string;
  user: ConsoleUser;
}

const storageKey = 'thundervox.console.session';

/**
 * Expiry of a token in epoch milliseconds, read from its own `exp` claim.
 *
 * The claim is UTC by definition, unlike the server's `expires_at` (server local time without an offset), so the
 * browser can compare it with its clock wherever it is. The signature is not checked here - the server does that
 * on every request; this only avoids starting a session that is already dead.
 */
export function tokenExpiresAtMs(token: string): number | null {
  const payload = token.split('.')[1];
  if (!payload) {
    return null;
  }
  try {
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const exp = (JSON.parse(json) as { exp?: unknown }).exp;
    return typeof exp === 'number' ? exp * 1000 : null;
  } catch {
    return null;
  }
}

/** The stored session if it is still alive; a broken or expired entry is dropped. */
export function readStoredSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return null;
    }
    const session = JSON.parse(raw) as Partial<StoredSession>;
    const expiresAt = session.token ? tokenExpiresAtMs(session.token) : null;
    if (!session.token || !session.user || expiresAt === null || expiresAt <= Date.now()) {
      localStorage.removeItem(storageKey);
      return null;
    }
    return { token: session.token, user: session.user };
  } catch {
    return null;
  }
}

export function writeStoredSession(session: StoredSession | null): void {
  try {
    if (session) {
      localStorage.setItem(storageKey, JSON.stringify(session));
    } else {
      localStorage.removeItem(storageKey);
    }
  } catch {
    // Storage blocked (private mode, policy): the session still works until the tab is reloaded
  }
}
