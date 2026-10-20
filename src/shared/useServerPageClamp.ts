// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useEffect } from 'react';

/**
 * A paged journal asked for a page past its end (an old link, rows gone by retention): once the total is known,
 * the address moves to the last page instead of showing "nothing found" for a journal that has rows.
 */
export function useServerPageClamp(total: number | undefined, page: number, size: number, setPage: (page: number) => void) {
  useEffect(() => {
    if (total === undefined || page === 0) {
      return;
    }
    const lastPage = Math.max(0, Math.ceil(total / size) - 1);
    if (page > lastPage) {
      setPage(lastPage);
    }
  }, [page, setPage, size, total]);
}
