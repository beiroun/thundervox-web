// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { formatServerTime } from '@/shared/serverTime';

/**
 * A moment in a table cell: the date and the time each kept whole, so a column squeezed on a phone breaks the line
 * between them and never inside a number.
 */
export function ServerTimeCell({ value }: { value: string | null | undefined }) {
  const [date, time] = formatServerTime(value).split(' ');

  return (
    <>
      <span className="tvx-nowrap">{date}</span>
      {time && (
        <>
          {' '}
          <span className="tvx-nowrap">{time}</span>
        </>
      )}
    </>
  );
}
