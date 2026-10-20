// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { memo, useCallback, useMemo, type MouseEvent, type ReactNode } from 'react';
import { Box, Table, UnstyledButton, type TableProps } from '@mantine/core';
import { IconArrowDown, IconArrowUp, IconArrowsSort } from '@tabler/icons-react';
import { useNavigate } from 'react-router';

import { ColumnResizeHandle } from '@/components/AdaptiveTable/ColumnResizeHandle';
import { ColumnsFitMenu } from '@/components/AdaptiveTable/ColumnsFitMenu';
import { fitColumns, type FittedColumn } from '@/components/AdaptiveTable/fitColumns';
import type { ColumnWidths, TableColumn, TableSort } from '@/components/AdaptiveTable/tableColumns';
import { useElementWidth } from '@/components/AdaptiveTable/useElementWidth';
import { useStoredColumnWidths } from '@/components/AdaptiveTable/useStoredColumnWidths';
import { useLang } from '@/i18n/LangContext';
import './adaptiveTable.css';

export interface AdaptiveTableProps<Row> {
  /** Where the operator's widths are remembered: `<page>.<table>` (`sip-accounts.list`), unique in the console. */
  tableId: string;
  rows: Row[];
  /** Stable (`useMemo`): rows are memoized by this reference. */
  columns: TableColumn<Row>[];
  rowKey: (row: Row) => string | number;
  sort?: TableSort | null;
  /** Makes the headings of columns with `sortValue` sort toggles. */
  onSort?: (key: string) => void;
  /** The card page of the row: click opens it, Ctrl/⌘/Shift-click and the middle button open a new tab. */
  rowHref?: (row: Row) => string;
  /** The card window of a row that has no page of its own; `rowHref` wins when both are given. */
  onRowClick?: (row: Row) => void;
  /** Mantine's look: sticky header and the like. */
  tableProps?: Omit<TableProps, 'children' | 'layout'>;
  /** Below the table inside the measured box (the empty state of a list). */
  children?: ReactNode;
}

function SortIcon({ active, direction }: { active: boolean; direction?: 'asc' | 'desc' }) {
  if (!active) {
    return <IconArrowsSort size={14} opacity={0.4} />;
  }
  return direction === 'asc' ? <IconArrowUp size={14} /> : <IconArrowDown size={14} />;
}

// The heading button keeps the look of a plain heading (the theme's size, case and colour)
const sortButtonStyle = {
  font: 'inherit',
  letterSpacing: 'inherit',
  textTransform: 'inherit',
  color: 'inherit',
  maxWidth: '100%',
} as const;

// Links, buttons and fields inside a row handle their own clicks
const isInteractive = (event: MouseEvent) =>
  (event.target as HTMLElement).closest('a, button, input, label') !== null;

interface TableRowProps<Row> {
  row: Row;
  columns: TableColumn<Row>[];
  href: string | null;
  onNavigate: (href: string, newTab: boolean) => void;
  onRowClick?: (row: Row) => void;
}

function TableRowBase<Row>({ row, columns, href, onNavigate, onRowClick }: TableRowProps<Row>) {
  // A <tr> cannot be wrapped in <a>: the middle button and Ctrl/⌘/Shift-click repeat a link by hand
  const handleClick = (event: MouseEvent) => {
    if (isInteractive(event)) {
      return;
    }
    // Selecting text with the mouse is not a click on the row
    if (window.getSelection()?.toString()) {
      return;
    }
    if (href) {
      onNavigate(href, event.ctrlKey || event.metaKey || event.shiftKey);
    } else {
      onRowClick?.(row);
    }
  };

  const handleAuxClick = (event: MouseEvent) => {
    if (href && event.button === 1 && !isInteractive(event)) {
      onNavigate(href, true);
    }
  };

  // Otherwise the middle button starts autoscroll instead of a click
  const handleMouseDown = (event: MouseEvent) => {
    if (href && event.button === 1 && !isInteractive(event)) {
      event.preventDefault();
    }
  };

  const clickable = Boolean(href || onRowClick);

  return (
    <Table.Tr
      onClick={clickable ? handleClick : undefined}
      onAuxClick={href ? handleAuxClick : undefined}
      onMouseDown={href ? handleMouseDown : undefined}
      style={clickable ? { cursor: 'pointer' } : undefined}
    >
      {columns.map((column) => (
        <Table.Td key={column.key} ta={column.align}>
          {column.render(row)}
        </Table.Td>
      ))}
    </Table.Tr>
  );
}

// Memoized rows keep a redraw on a new width or a new page cheap
const TableRow = memo(TableRowBase) as typeof TableRowBase;

interface HeaderCellProps<Row> {
  fitted: FittedColumn<Row>;
  /** The column right of this heading's edge; none – the last heading, its edge is the table's. */
  next?: FittedColumn<Row>;
  sort?: TableSort | null;
  onSort?: (key: string) => void;
  onPreviewWidths: (widths: ColumnWidths) => void;
  onCommitWidths: () => void;
  onResetWidth: (key: string) => void;
  /** The last heading carries the columns menu in its corner. */
  columnsMenu?: ReactNode;
}

function HeaderCell<Row>({
  fitted,
  next,
  sort,
  onSort,
  onPreviewWidths,
  onCommitWidths,
  onResetWidth,
  columnsMenu,
}: HeaderCellProps<Row>) {
  const { t } = useLang();
  const { column, width } = fitted;
  const sortable = Boolean(column.sortValue && onSort);
  const active = sortable && sort?.key === column.key;
  const direction = active ? sort?.direction : undefined;
  // What the next click does: the heading cycles descending → ascending → the list's own order
  const sortHint = !active ? t.table.sortDescending : direction === 'asc' ? t.table.sortReset : t.table.sortAscending;
  const heading = (
    <span className="tvx-table__heading">
      <span className="tvx-table__heading-text">{column.title}</span>
      {sortable && <SortIcon active={active} direction={direction} />}
    </span>
  );

  return (
    <Table.Th
      ta={column.align}
      data-with-columns-menu={columnsMenu ? true : undefined}
      aria-sort={active ? (direction === 'asc' ? 'ascending' : 'descending') : undefined}
    >
      {sortable ? (
        <UnstyledButton
          className="tvx-table__sort"
          onClick={() => onSort?.(column.key)}
          style={sortButtonStyle}
          title={sortHint}
        >
          {heading}
        </UnstyledButton>
      ) : (
        heading
      )}
      {columnsMenu}
      {next && (
        <ColumnResizeHandle
          columnKey={column.key}
          columnTitle={column.title}
          width={width}
          nextColumnKey={next.column.key}
          nextWidth={next.width}
          onPreview={onPreviewWidths}
          onCommit={onCommitWidths}
          onReset={onResetWidth}
        />
      )}
    </Table.Th>
  );
}

/**
 * Every table of the console: never scrolls sideways – columns that do not fit leave by priority
 * (`TableColumn.priority`) and the free width goes to the growing columns; the edge between two headings moves
 * width from one column to the other, remembered per browser under `tableId`. A row opens its card: a page
 * (`rowHref`) or a window (`onRowClick`); actions live in the card, never in a cell. A scrolling parent needs
 * `scrollbar-gutter: stable`, or the scrollbar coming and going would hide and show columns in turn.
 */
export function AdaptiveTable<Row>({
  tableId,
  rows,
  columns,
  rowKey,
  sort,
  onSort,
  rowHref,
  onRowClick,
  tableProps,
  children,
}: AdaptiveTableProps<Row>) {
  const navigate = useNavigate();
  const [boxRef, boxWidth] = useElementWidth<HTMLDivElement>();
  const { widths, previewWidths, commitWidths, resetWidth, resetAllWidths } = useStoredColumnWidths(tableId);

  const fit = useMemo(() => fitColumns(columns, widths, boxWidth), [columns, widths, boxWidth]);

  // Rows redraw only when the set of columns changes, not on every width
  const hiddenKeys = fit.hidden.map((column) => column.key).join('\n');
  const visibleColumns = useMemo(() => {
    const hidden = new Set(hiddenKeys.split('\n'));
    return columns.filter((column) => !hidden.has(column.key));
  }, [columns, hiddenKeys]);

  const onNavigate = useCallback(
    (href: string, newTab: boolean) => {
      if (newTab) {
        window.open(href, '_blank', 'noopener');
      } else {
        void navigate(href);
      }
    },
    [navigate],
  );

  const hasOperatorWidths = columns.some((column) => widths[column.key] !== undefined);
  const columnsMenu =
    fit.hidden.length > 0 || hasOperatorWidths ? (
      <ColumnsFitMenu
        hiddenTitles={fit.hidden.map((column) => ({ key: column.key, title: column.title }))}
        hasOperatorWidths={hasOperatorWidths}
        onResetWidths={resetAllWidths}
      />
    ) : undefined;
  const lastIndex = fit.visible.length - 1;

  return (
    <Box ref={boxRef} className="tvx-table">
      <Table {...tableProps} layout="fixed">
        <colgroup>
          {fit.visible.map(({ column, width }) => (
            <col key={column.key} style={{ width }} />
          ))}
        </colgroup>
        <Table.Thead>
          <Table.Tr>
            {fit.visible.map((fitted, index) => (
              <HeaderCell
                key={fitted.column.key}
                fitted={fitted}
                next={fit.visible[index + 1]}
                sort={sort}
                onSort={onSort}
                onPreviewWidths={previewWidths}
                onCommitWidths={commitWidths}
                onResetWidth={resetWidth}
                columnsMenu={index === lastIndex ? columnsMenu : undefined}
              />
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((row) => (
            <TableRow
              key={rowKey(row)}
              row={row}
              columns={visibleColumns}
              href={rowHref?.(row) ?? null}
              onNavigate={onNavigate}
              onRowClick={onRowClick}
            />
          ))}
        </Table.Tbody>
      </Table>
      {children}
    </Box>
  );
}
