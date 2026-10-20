// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import type { KeyboardEvent, MouseEvent, PointerEvent } from 'react';

import { minColumnWidth, type ColumnWidths } from '@/components/AdaptiveTable/tableColumns';
import { useLang } from '@/i18n/LangContext';

const keyboardStep = 10;
const keyboardStepLarge = 40;

const resizingBodyClass = 'tvx-table-resizing';

/** Two neighbours with their widths on the screen now: the edge between them moves from here. */
interface ColumnEdge {
  columnKey: string;
  width: number;
  nextColumnKey: string;
  nextWidth: number;
}

interface ColumnResizeHandleProps extends ColumnEdge {
  columnTitle: string;
  onPreview: (widths: ColumnWidths) => void;
  onCommit: () => void;
  onReset: (key: string) => void;
}

/**
 * Moves the edge by `shift` px. A table that fits its box has no spare width: what the column gets, its right
 * neighbour gives, so the table keeps its width and every other column stays where it is. The edge stops where
 * either column reaches `minColumnWidth`; null – the pair is already narrower (a table squeezed below its priority 1
 * columns), nothing to trade.
 */
function widthsAfterShift(edge: ColumnEdge, shift: number): ColumnWidths | null {
  const minShift = minColumnWidth - edge.width;
  const maxShift = edge.nextWidth - minColumnWidth;
  if (minShift > maxShift) {
    return null;
  }
  const boundedShift = Math.min(Math.max(Math.round(shift), minShift), maxShift);
  return { [edge.columnKey]: edge.width + boundedShift, [edge.nextColumnKey]: edge.nextWidth - boundedShift };
}

// The heading is a sort toggle: a press on its edge must not sort
const stopClick = (event: MouseEvent) => event.stopPropagation();

/**
 * The right edge of a heading – the border with the next column (the last column has none: its right edge is the
 * table's): drag – the width moves between the two, double click – the column back to its default, arrows on the
 * focused edge – 10 px (with Shift – 40 px).
 */
export function ColumnResizeHandle({
  columnKey,
  columnTitle,
  width,
  nextColumnKey,
  nextWidth,
  onPreview,
  onCommit,
  onReset,
}: ColumnResizeHandleProps) {
  const { t } = useLang();
  const edge: ColumnEdge = { columnKey, width, nextColumnKey, nextWidth };

  const preview = (startEdge: ColumnEdge, shift: number) => {
    const widths = widthsAfterShift(startEdge, shift);
    if (widths) {
      onPreview(widths);
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const handle = event.currentTarget;
    const startX = event.clientX;
    const startEdge = edge;
    handle.setPointerCapture(event.pointerId);
    // Over the cells the cursor would flip back to the arrow and the text would get selected
    document.body.classList.add(resizingBodyClass);

    const move = (moveEvent: globalThis.PointerEvent) => preview(startEdge, moveEvent.clientX - startX);
    const end = () => {
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', end);
      handle.removeEventListener('pointercancel', end);
      document.body.classList.remove(resizingBodyClass);
      onCommit();
    };
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }
    event.preventDefault();
    const step = event.shiftKey ? keyboardStepLarge : keyboardStep;
    preview(edge, event.key === 'ArrowRight' ? step : -step);
    onCommit();
  };

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={t.table.columnWidth(columnTitle)}
      aria-valuenow={width}
      tabIndex={0}
      title={t.table.resizeHint}
      className="tvx-table__resize"
      onPointerDown={handlePointerDown}
      onDoubleClick={() => onReset(columnKey)}
      onClick={stopClick}
      onKeyDown={handleKeyDown}
    />
  );
}
