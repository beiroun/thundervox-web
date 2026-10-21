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

// "2026-10-05T21:04:11.123456": the fields read by hand, because Safari does not parse six fraction digits
const serverTimePattern = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?/;

/**
 * Seconds between two server timestamps, or null when either is missing. Both are the server's local time, so
 * they are compared as they are, without a zone.
 */
export function serverTimeSecondsBetween(from: string | null | undefined, to: string | null | undefined): number | null {
  const start = serverTimeMillis(from);
  const end = serverTimeMillis(to);
  return start === null || end === null ? null : Math.max(0, Math.round((end - start) / 1000));
}

function serverTimeMillis(value: string | null | undefined): number | null {
  const match = value ? serverTimePattern.exec(value) : null;
  if (!match) {
    return null;
  }
  const [, year, month, day, hour, minute, second, fraction = '0'] = match;
  const millis = Number(fraction.padEnd(3, '0').slice(0, 3));
  return Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second), millis);
}

/** A span of a call as a clock reads: 0:45, 12:03, 1:02:03. */
export function formatSpan(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = String(seconds % 60).padStart(2, '0');
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')}:${rest}` : `${minutes}:${rest}`;
}
