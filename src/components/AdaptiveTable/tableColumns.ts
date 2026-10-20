// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import type { ReactNode } from 'react';

/**
 * The order columns leave a table that does not fit its box (a table never scrolls sideways): 1 – what the row is
 * (the number, the name), never hidden; 2 – what rows are told apart by (status, role, kind, the main time);
 * 3 – secondary attributes; 4 – technical fields and secondary dates; 5 – goes first. Equal priorities leave from
 * the right.
 */
export type ColumnPriority = 1 | 2 | 3 | 4 | 5;

export const defaultColumnPriority: ColumnPriority = 3;

/** The narrowest a column gets, by the operator's drag or by the layout. */
export const minColumnWidth = 56;

/** Where a growing column without `minWidth` starts. */
export const growingColumnStartWidth = 160;

/** What a column sorts by; empty values go last in both directions. */
export type SortValue = string | number | null | undefined;

export type SortDirection = 'asc' | 'desc';

export interface TableSort {
  key: string;
  direction: SortDirection;
}

/** One column of a table; the array must be stable (`useMemo`): rows are memoized by it. */
export interface TableColumn<Row> {
  key: string;
  title: string;
  render: (row: Row) => ReactNode;
  /** Makes the heading a sort toggle when the table gets `onSort`; absent – the column does not sort. */
  sortValue?: (row: Row) => SortValue;
  /** The default width, px. None – a growing column: it starts at `minWidth` and takes the free width. */
  width?: number;
  /**
   * A growing column never gets narrower by itself; the operator may still drag it down to `minColumnWidth`. A column
   * of a fixed width keeps it as its floor when even the columns of priority 1 do not fit (a phone): a badge or a
   * number keeps the width its value needs, the text columns give up the rest.
   */
  minWidth?: number;
  /** `defaultColumnPriority` when not given. */
  priority?: ColumnPriority;
  align?: 'left' | 'center' | 'right';
}

/** The operator's widths by column key, px; a column without one has its default width. */
export type ColumnWidths = Readonly<Record<string, number>>;
