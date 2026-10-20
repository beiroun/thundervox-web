// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Alert, Box, Button, Group, LoadingOverlay, Text } from '@mantine/core';
import { IconFilterOff, IconRefresh } from '@tabler/icons-react';

import { describeApiError } from '@/api/baseQuery';
import { AdaptiveTable, type AdaptiveTableProps } from '@/components/AdaptiveTable/AdaptiveTable';
import { useLang } from '@/i18n/LangContext';

interface ListTableProps<Row> extends Omit<AdaptiveTableProps<Row>, 'children' | 'tableProps'> {
  /** The first load: a dense cover over the table area. */
  isInitialLoading: boolean;
  /** A new page or search of a paged journal: the previous rows stay under a light cover. */
  isLoadingNewArgs?: boolean;
  error?: FetchBaseQueryError | SerializedError;
  onRetry: () => void;
  isRetrying?: boolean;
  /** What an empty list without a search or a filter says. */
  emptyText: string;
  isFiltered: boolean;
  onResetFilters: () => void;
  /** The table takes the height left in its page and scrolls inside, under a sticky header. */
  fill?: boolean;
}

/**
 * A list's table with its states: the error above the table (rows loaded before stay under it, "retry" asks for
 * the list again), the covers of the first and of a new load, and the two empty states under the headings – no
 * rows at all, or nothing found with a reset of the search and the filters.
 */
export function ListTable<Row>({
  isInitialLoading,
  isLoadingNewArgs = false,
  error,
  onRetry,
  isRetrying = false,
  emptyText,
  isFiltered,
  onResetFilters,
  fill = false,
  ...tableProps
}: ListTableProps<Row>) {
  const { t } = useLang();
  const isEmpty = !isInitialLoading && !error && tableProps.rows.length === 0;

  return (
    <>
      {error && (
        <Alert color="red" title={t.table.loadError} mb="md">
          <Group justify="space-between" align="center" wrap="wrap" gap="sm">
            <Text size="sm">{describeApiError(error, t.api)}</Text>
            <Button
              size="xs"
              variant="default"
              leftSection={<IconRefresh size={14} />}
              loading={isRetrying}
              onClick={onRetry}
            >
              {t.common.retry}
            </Button>
          </Group>
        </Alert>
      )}
      <Box className={fill ? 'tvx-listtable tvx-listtable--fill' : 'tvx-listtable'} mih={isInitialLoading ? 160 : undefined}>
        <div className="tvx-listtable__scroll">
          <AdaptiveTable {...tableProps} tableProps={{ stickyHeader: fill }}>
            {isEmpty && (
              <div className="tvx-listtable__empty">
                <Text size="sm" c="dimmed">
                  {isFiltered ? t.table.nothingFound : emptyText}
                </Text>
                {isFiltered && (
                  <Button size="xs" variant="light" leftSection={<IconFilterOff size={14} />} onClick={onResetFilters}>
                    {t.table.resetFilters}
                  </Button>
                )}
              </div>
            )}
          </AdaptiveTable>
        </div>
        {/* On the outer block, not the scrolling one: the cover always closes the visible part */}
        <LoadingOverlay
          visible={isInitialLoading || isLoadingNewArgs}
          zIndex={3}
          overlayProps={{ backgroundOpacity: isInitialLoading ? 0.85 : 0.6, color: 'var(--mantine-color-body)' }}
          loaderProps={{ type: 'bars', size: 'sm' }}
        />
      </Box>
    </>
  );
}
