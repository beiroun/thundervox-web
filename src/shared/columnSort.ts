// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import type { SortValue, TableColumn, TableSort } from '@/components/AdaptiveTable/tableColumns';

/**
 * A click on a heading cycles three states: descending first (the newest, the biggest, the last letter on top),
 * then ascending, then the list's own order. A click on another column starts it from descending.
 */
export function nextColumnSort(current: TableSort | null, key: string): TableSort | null {
  if (current?.key !== key) {
    return { key, direction: 'desc' };
  }
  return current.direction === 'desc' ? { key, direction: 'asc' } : null;
}

const isEmpty = (value: SortValue) => value == null || value === '';

/**
 * Comparator of a list held in memory by the sorted column's `sortValue`, or undefined for the list's own order.
 * Empty values go last in both directions, so a sorted column starts with rows that have something to show; ties
 * keep the list's order (the sort is stable).
 */
export function rowComparator<Row>(
  columns: TableColumn<Row>[],
  sort: TableSort | null,
  locale: string,
): ((a: Row, b: Row) => number) | undefined {
  const valueOf = sort ? columns.find((column) => column.key === sort.key)?.sortValue : undefined;
  if (!sort || !valueOf) {
    return undefined;
  }
  const collator = new Intl.Collator(locale, { numeric: true, sensitivity: 'base' });
  const sign = sort.direction === 'asc' ? 1 : -1;

  return (a, b) => {
    const left = valueOf(a);
    const right = valueOf(b);
    if (isEmpty(left) || isEmpty(right)) {
      return isEmpty(left) === isEmpty(right) ? 0 : isEmpty(left) ? 1 : -1;
    }
    const order =
      typeof left === 'number' && typeof right === 'number' ? left - right : collator.compare(String(left), String(right));
    return sign * order;
  };
}
