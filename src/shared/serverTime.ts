// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.

/**
 * Server timestamps are local server time without an offset ("2026-10-05T21:04:11.123456"). They are shown as
 * they are - converting them as if they were the browser's own local time would shift them by the zone difference.
 */
export function formatServerTime(value: string | null | undefined): string {
  if (!value) {
    return '–';
  }
  return value.replace('T', ' ').slice(0, 19);
}
