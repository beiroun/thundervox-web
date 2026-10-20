// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import {
  defaultColumnPriority,
  growingColumnStartWidth,
  minColumnWidth,
  type ColumnWidths,
  type TableColumn,
} from '@/components/AdaptiveTable/tableColumns';

export interface FittedColumn<Row> {
  column: TableColumn<Row>;
  width: number;
}

export interface ColumnsFit<Row> {
  visible: FittedColumn<Row>[];
  /** In the order of the table, for the "did not fit" hint. */
  hidden: TableColumn<Row>[];
}

const isGrowing = <Row>(column: TableColumn<Row>) => column.width === undefined;

/** The width a column asks for before the free width is shared: the operator's, else the default. */
export const requestedWidthOf = <Row>(column: TableColumn<Row>, widths: ColumnWidths) =>
  Math.max(minColumnWidth, widths[column.key] ?? column.width ?? column.minWidth ?? growingColumnStartWidth);

// The free width goes to the growing columns the operator has not resized; failing them, to every column not
// resized; failing that, to the last one – the table always fills its box
const receiversOfFreeWidth = <Row>(visible: TableColumn<Row>[], widths: ColumnWidths) => {
  const notResized = visible.filter((column) => widths[column.key] === undefined);
  const growing = notResized.filter(isGrowing);
  if (growing.length > 0) {
    return growing;
  }
  if (notResized.length > 0) {
    return notResized;
  }
  return visible.slice(-1);
};

const sumOf = (values: number[]) => values.reduce((total, value) => total + value, 0);

// Columns of priority 1 that still do not fit: a fixed column keeps its `minWidth` (a status badge cut to «ДОСТАВ…»
// told nothing), the others share what is left in proportion to what they give up; when even the floors do not
// fit, the floors shrink in proportion
const squeezed = <Row>(visible: TableColumn<Row>[], widthOf: (column: TableColumn<Row>) => number, boxWidth: number) => {
  const floorOf = (column: TableColumn<Row>) =>
    isGrowing(column) ? minColumnWidth : Math.min(widthOf(column), column.minWidth ?? minColumnWidth);
  const floorsWidth = sumOf(visible.map(floorOf));
  if (floorsWidth >= boxWidth) {
    const scale = boxWidth / floorsWidth;
    return visible.map((column) => ({ column, width: Math.floor(floorOf(column) * scale) }));
  }
  const slackWidth = sumOf(visible.map((column) => widthOf(column) - floorOf(column)));
  const spareWidth = boxWidth - floorsWidth;
  return visible.map((column) => ({
    column,
    width: floorOf(column) + Math.floor(((widthOf(column) - floorOf(column)) * spareWidth) / slackWidth),
  }));
};

/**
 * Lays the columns out in `boxWidth`: hides columns by priority (the biggest number first, equal ones from the
 * right) until the rest fit, then shares the free width among the growing columns. Strict order: a less important
 * column never stays while a more important one is hidden. Columns of priority 1 are never hidden; when even they
 * do not fit they shrink down to their floors (the cells wrap) – the table never scrolls sideways.
 */
export function fitColumns<Row>(columns: TableColumn<Row>[], widths: ColumnWidths, boxWidth: number): ColumnsFit<Row> {
  const requested = new Map(columns.map((column) => [column.key, requestedWidthOf(column, widths)]));
  const widthOf = (column: TableColumn<Row>) => requested.get(column.key) ?? minColumnWidth;

  // Not measured yet: everything as requested, the layout comes before the first paint
  if (boxWidth <= 0) {
    return { visible: columns.map((column) => ({ column, width: widthOf(column) })), hidden: [] };
  }

  const hidingOrder = columns
    .map((column, index) => ({ column, index, priority: column.priority ?? defaultColumnPriority }))
    .filter((entry) => entry.priority > 1)
    .sort((a, b) => b.priority - a.priority || b.index - a.index);

  const hiddenKeys = new Set<string>();
  let total = sumOf(columns.map(widthOf));
  for (const { column } of hidingOrder) {
    if (total <= boxWidth) {
      break;
    }
    hiddenKeys.add(column.key);
    total -= widthOf(column);
  }

  const visible = columns.filter((column) => !hiddenKeys.has(column.key));
  const hidden = columns.filter((column) => hiddenKeys.has(column.key));

  if (total > boxWidth) {
    return { visible: squeezed(visible, widthOf, boxWidth), hidden };
  }

  const receivers = receiversOfFreeWidth(visible, widths);
  const receiversWidth = sumOf(receivers.map(widthOf));
  const freeWidth = boxWidth - total;
  const extraByKey = new Map<string, number>();
  let shared = 0;
  receivers.forEach((column, index) => {
    const isLast = index === receivers.length - 1;
    const extra = isLast ? freeWidth - shared : Math.floor((freeWidth * widthOf(column)) / receiversWidth);
    extraByKey.set(column.key, extra);
    shared += extra;
  });

  return {
    visible: visible.map((column) => ({ column, width: widthOf(column) + (extraByKey.get(column.key) ?? 0) })),
    hidden,
  };
}
