// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useMemo } from 'react';

import { isExactSmartMatch, matchesSmartQuery, parseSmartQuery } from '@/shared/smartQuery';

interface ClientListOptions<Row> {
  /** The raw search text from the address; the smart-search rule is applied here. */
  query?: string;
  /** The searchable fields of a row glued by `smartSearchDocument(...)`; stable. */
  searchDocumentOf: (row: Row) => string;
  /** Keys a one-word query must equal to put the row first (number, external id, login). */
  exactKeysOf?: (row: Row) => (string | number | null | undefined)[];
  /** The list's other filters. */
  matches?: (row: Row) => boolean;
  compare?: (a: Row, b: Row) => number;
  /** Zero-based page and its size; without a size the whole filtered list is one page. */
  page?: number;
  size?: number;
}

export interface ClientListResult<Row> {
  rows: Row[];
  /** Rows that pass the search and the filters, across all pages. */
  total: number;
  /** The page actually shown: a page past the end (a stale link, rows gone) falls back to the last one. */
  page: number;
}

/**
 * Search, filters, sorting and pages over a list the server returns whole (SIP numbers, console users, tokens).
 * Only for such lists: filtering one page of a paged journal on the client would silently hide rows.
 */
export function useClientList<Row>(
  allRows: Row[] | undefined,
  { query, searchDocumentOf, exactKeysOf, matches, compare, page = 0, size }: ClientListOptions<Row>,
): ClientListResult<Row> {
  const documents = useMemo(() => (allRows ?? []).map(searchDocumentOf), [allRows, searchDocumentOf]);

  const filtered = useMemo(() => {
    const smartQuery = parseSmartQuery(query);
    const found = (allRows ?? []).filter(
      (row, index) =>
        (!smartQuery || matchesSmartQuery(smartQuery, documents[index] ?? '')) && (!matches || matches(row)),
    );
    const sorted = compare ? [...found].sort(compare) : found;
    if (!smartQuery?.exactCandidate || !exactKeysOf) {
      return sorted;
    }
    // Exact hits first, the order inside both groups is kept
    const exact = sorted.filter((row) => isExactSmartMatch(smartQuery, exactKeysOf(row)));
    if (exact.length === 0) {
      return sorted;
    }
    const exactSet = new Set(exact);
    return [...exact, ...sorted.filter((row) => !exactSet.has(row))];
  }, [allRows, documents, query, matches, compare, exactKeysOf]);

  const lastPage = size ? Math.max(0, Math.ceil(filtered.length / size) - 1) : 0;
  const shownPage = Math.min(page, lastPage);
  const rows = useMemo(
    () => (size ? filtered.slice(shownPage * size, (shownPage + 1) * size) : filtered),
    [filtered, shownPage, size],
  );

  return { rows, total: filtered.length, page: shownPage };
}
