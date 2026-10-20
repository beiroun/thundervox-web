// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useRef } from 'react';
import { Group, Pagination, Select, Text } from '@mantine/core';

import { localeOf } from '@/i18n/dict';
import { useLang } from '@/i18n/LangContext';
import { useIsPhone } from '@/shared/useIsPhone';
import { pageSizes } from '@/shared/useListUrlState';

interface TablePaginationProps {
  total: number;
  /** Zero-based, as in the address. */
  page?: number;
  /** Absent: a short list on one page, only the count shows. */
  size?: number;
  onPage?: (page: number) => void;
  onSize?: (size: number) => void;
  /** While the next page loads: no queue of clicks. */
  disabled?: boolean;
}

/**
 * Under a table: "found N" on the left, the pages and the page size on the right. On a phone the pages shrink to
 * the arrows around the current one, with finger-sized buttons, and wrap under the count when they must.
 */
export function TablePagination({ total, page = 0, size, onPage, onSize, disabled = false }: TablePaginationProps) {
  const { t, lang } = useLang();
  const isPhone = useIsPhone();
  const pageCount = size ? Math.max(1, Math.ceil(total / size)) : 1;
  const rootRef = useRef<HTMLDivElement>(null);

  // On a phone the page scrolls, not the table, and a tap on «2» under the table left the reader at the end of the
  // new page: the table above the pagination comes into view from its first row
  const changePage = (next: number) => {
    onPage?.(next);
    const table = rootRef.current?.previousElementSibling;
    if (isPhone && table?.classList.contains('tvx-listtable')) {
      table.scrollIntoView({ block: 'start' });
    }
  };

  return (
    <Group ref={rootRef} justify="space-between" align="center" wrap="wrap" gap="sm" className="tvx-pagination">
      <Text size="sm" c="dimmed">
        {t.table.found}{' '}
        <Text span size="sm" c="var(--mantine-color-text)">
          {total.toLocaleString(localeOf(lang))}
        </Text>
      </Text>
      {size !== undefined && (
        <Group gap="sm" wrap={isPhone ? 'wrap' : 'nowrap'}>
          {pageCount > 1 && (
            <Pagination
              size={isPhone ? 'md' : 'sm'}
              withEdges={!isPhone}
              siblings={isPhone ? 0 : 1}
              total={pageCount}
              value={page + 1}
              onChange={(next) => changePage(next - 1)}
              disabled={disabled}
            />
          )}
          <Select
            size={isPhone ? 'sm' : 'xs'}
            w={80}
            aria-label={t.table.pageSize}
            data={pageSizes.map(String)}
            value={String(size)}
            allowDeselect={false}
            onChange={(next) => next && onSize?.(Number(next))}
          />
        </Group>
      )}
    </Group>
  );
}
