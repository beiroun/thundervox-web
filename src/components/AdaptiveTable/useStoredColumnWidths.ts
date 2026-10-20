// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useCallback, useState } from 'react';

import { minColumnWidth, type ColumnWidths } from '@/components/AdaptiveTable/tableColumns';

const storagePrefix = 'tvx-table-column-widths:';

const emptyWidths: ColumnWidths = {};

// Storage can be missing or throw (a private window, blocked site data): the widths then live until the reload
function readStoredWidths(tableId: string): ColumnWidths {
  try {
    const raw = window.localStorage.getItem(storagePrefix + tableId);
    if (!raw) {
      return emptyWidths;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return emptyWidths;
    }
    return Object.fromEntries(
      Object.entries(parsed).filter(
        (entry): entry is [string, number] =>
          typeof entry[1] === 'number' && Number.isFinite(entry[1]) && entry[1] >= minColumnWidth,
      ),
    );
  } catch {
    return emptyWidths;
  }
}

function writeStoredWidths(tableId: string, widths: ColumnWidths): void {
  try {
    if (Object.keys(widths).length === 0) {
      window.localStorage.removeItem(storagePrefix + tableId);
    } else {
      window.localStorage.setItem(storagePrefix + tableId, JSON.stringify(widths));
    }
  } catch {
    // The widths stay for this visit only
  }
}

export interface StoredColumnWidths {
  widths: ColumnWidths;
  /** While dragging: the screen follows, the storage does not; one edge sets the widths of both its columns. */
  previewWidths: (widths: ColumnWidths) => void;
  /** The drag is over: the widths go to the storage. */
  commitWidths: () => void;
  resetWidth: (key: string) => void;
  resetAllWidths: () => void;
}

/**
 * The operator's column widths of one table, remembered in this browser under `tableId` – a convenience of one
 * operator, not a setting of the console; every table has its own id.
 */
export function useStoredColumnWidths(tableId: string): StoredColumnWidths {
  const [stored, setStored] = useState(() => ({ tableId, widths: readStoredWidths(tableId) }));

  if (stored.tableId !== tableId) {
    setStored({ tableId, widths: readStoredWidths(tableId) });
  }

  const previewWidths = useCallback((changed: ColumnWidths) => {
    setStored((current) =>
      Object.entries(changed).every(([key, width]) => current.widths[key] === width)
        ? current
        : { ...current, widths: { ...current.widths, ...changed } },
    );
  }, []);

  // Written from the latest state: the last pointer move may not have rendered yet
  const commitWidths = useCallback(() => {
    setStored((current) => {
      writeStoredWidths(current.tableId, current.widths);
      return current;
    });
  }, []);

  const resetWidth = useCallback((key: string) => {
    setStored((current) => {
      if (current.widths[key] === undefined) {
        return current;
      }
      const widths = { ...current.widths };
      delete widths[key];
      writeStoredWidths(current.tableId, widths);
      return { ...current, widths };
    });
  }, []);

  const resetAllWidths = useCallback(() => {
    setStored((current) => {
      writeStoredWidths(current.tableId, emptyWidths);
      return { ...current, widths: emptyWidths };
    });
  }, []);

  return { widths: stored.widths, previewWidths, commitWidths, resetWidth, resetAllWidths };
}
