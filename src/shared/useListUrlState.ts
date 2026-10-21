// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';

import type { TableSort } from '@/components/AdaptiveTable/tableColumns';
import { nextColumnSort } from '@/shared/columnSort';

export const pageSizes = [25, 50, 100, 200] as const;
export const defaultPageSize = 50;

type UrlValue = string | number | null | undefined;

interface ListUrlStateOptions {
  /** Keys of this list in the address: '' on a page with one list, `tokens_` next to another list. */
  prefix?: string;
  defaultSize?: number;
  /** The list's own filters (the kind of a number): written as `<prefix><key>`, cleared by reset; a module constant. */
  filterKeys?: readonly string[];
}

export interface ListUrlState {
  /** The applied search as typed; the smart-search rule decides whether it filters. */
  query: string | undefined;
  /** Zero-based. */
  page: number;
  size: number;
  sort: TableSort | null;
  filters: Readonly<Record<string, string | undefined>>;
  /** A search or a filter is set: the empty table says "nothing found" and offers the reset. */
  isFiltered: boolean;
  setQuery: (query: string | undefined) => void;
  setFilter: (key: string, value: string | undefined) => void;
  setPage: (page: number) => void;
  setSize: (size: number) => void;
  toggleSort: (key: string) => void;
  /** Clears the search and the filters; the page size and the sort stay, as the operator's way of reading. */
  reset: () => void;
  /**
   * Replaces the search and the filters at once (a link "everything about this number"): one change of the
   * address, because two calls in a row would each start from the same old address and the second would win.
   */
  select: (query: string | undefined, filters?: Readonly<Record<string, string | undefined>>) => void;
}

const isPageSize = (value: number) => (pageSizes as readonly number[]).includes(value);

/**
 * The state of one list lives in the address: a link, F5 and "back" from a card return the same selection. Defaults
 * are not written (`/sip-accounts`, not `?page=0&size=50`), anything invalid in a hand-edited link reads as the
 * default, every change replaces the history entry and any change of the selection starts from the first page.
 */
export function useListUrlState({ prefix = '', defaultSize = defaultPageSize, filterKeys = [] }: ListUrlStateOptions = {}): ListUrlState {
  const [params, setParams] = useSearchParams();
  const keyOf = useCallback((name: string) => `${prefix}${name}`, [prefix]);

  const patch = useCallback(
    (changes: Record<string, UrlValue>) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          for (const [name, value] of Object.entries(changes)) {
            if (value === undefined || value === null || value === '') {
              next.delete(keyOf(name));
            } else {
              next.set(keyOf(name), String(value));
            }
          }
          return next;
        },
        // A search, a filter or a sort keeps the page where it is; the pagination brings the table into view itself
        { replace: true, preventScrollReset: true },
      );
    },
    [keyOf, setParams],
  );

  const query = params.get(keyOf('query')) ?? undefined;
  const rawPage = params.get(keyOf('page')) ?? '';
  const page = /^\d+$/.test(rawPage) ? Number(rawPage) : 0;
  const rawSize = Number(params.get(keyOf('size')));
  const size = isPageSize(rawSize) ? rawSize : defaultSize;
  const sortKey = params.get(keyOf('sort'));
  const sortDirection = params.get(keyOf('direction'));
  // A link with a column and no direction reads as descending, the first state of a heading
  const sort = useMemo<TableSort | null>(
    () => (sortKey ? { key: sortKey, direction: sortDirection === 'asc' ? 'asc' : 'desc' } : null),
    [sortKey, sortDirection],
  );

  const filterValues = filterKeys.map((key) => params.get(keyOf(key)) ?? undefined);
  const filters = Object.fromEntries(filterKeys.map((key, index) => [key, filterValues[index]]));

  const isFiltered = Boolean(query) || filterValues.some(Boolean);

  const setQuery = useCallback((value: string | undefined) => patch({ query: value, page: undefined }), [patch]);
  const setFilter = useCallback(
    (key: string, value: string | undefined) => patch({ [key]: value, page: undefined }),
    [patch],
  );
  const setPage = useCallback((value: number) => patch({ page: value > 0 ? value : undefined }), [patch]);
  const setSize = useCallback(
    (value: number) => patch({ size: value === defaultSize ? undefined : value, page: undefined }),
    [defaultSize, patch],
  );
  const toggleSort = useCallback(
    (key: string) => {
      const next = nextColumnSort(sort, key);
      patch({ sort: next?.key, direction: next?.direction, page: undefined });
    },
    [patch, sort],
  );
  const reset = useCallback(
    () => patch({ query: undefined, page: undefined, ...Object.fromEntries(filterKeys.map((key) => [key, undefined])) }),
    [filterKeys, patch],
  );

  const select = useCallback(
    (nextQuery: string | undefined, nextFilters: Readonly<Record<string, string | undefined>> = {}) =>
      patch({
        query: nextQuery,
        page: undefined,
        ...Object.fromEntries(filterKeys.map((key) => [key, nextFilters[key]])),
      }),
    [filterKeys, patch],
  );

  return { query, page, size, sort, filters, isFiltered, setQuery, setFilter, setPage, setSize, toggleSort, reset, select };
}
