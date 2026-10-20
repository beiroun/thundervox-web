// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useMemo, useState } from 'react';
import { Badge, Button, Group, Text } from '@mantine/core';
import { IconFilterOff, IconRefresh } from '@tabler/icons-react';

import { useGetAuditPageQuery } from '@/api/auditApi';
import type { AuditEntry } from '@/api/types';
import type { TableColumn } from '@/components/AdaptiveTable/tableColumns';
import { ListTable } from '@/components/ListTable/ListTable';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { SearchInput } from '@/components/SearchInput/SearchInput';
import { TablePagination } from '@/components/TablePagination/TablePagination';
import { useLang } from '@/i18n/LangContext';
import { AuditDetailsPreview, auditActionLabel } from '@/pages/Audit/auditEntryText';
import { AuditEntryCardModal } from '@/pages/Audit/AuditEntryCardModal';
import { ServerTimeCell } from '@/components/ServerTimeCell/ServerTimeCell';
import { sendableSearchQuery } from '@/shared/smartQuery';
import { useListUrlState } from '@/shared/useListUrlState';
import { useServerPageClamp } from '@/shared/useServerPageClamp';

/**
 * Who changed what, newest first. Every role may read it, nobody can edit it; the server pages and searches it,
 * so the columns keep the journal's own order. A row opens the entry's card with every detail.
 */
export function Audit() {
  const { t } = useLang();
  const list = useListUrlState();
  const { data, currentData, isLoading, isFetching, error, refetch } = useGetAuditPageQuery(
    { page: list.page, size: list.size, query: sendableSearchQuery(list.query) },
    { refetchOnMountOrArgChange: true },
  );
  const [opened, setOpened] = useState<AuditEntry | null>(null);
  useServerPageClamp(data?.total, list.page, list.size, list.setPage);

  const columns = useMemo<TableColumn<AuditEntry>[]>(
    () => [
      {
        key: 'time',
        title: t.audit.columns.time,
        width: 170,
        // The date over the time, as the cell wraps them on a phone
        minWidth: 96,
        priority: 1,
        render: (entry) => <ServerTimeCell value={entry.created_at} />,
      },
      {
        key: 'who',
        title: t.audit.columns.who,
        width: 150,
        priority: 1,
        render: (entry) => (
          <Group gap={6} wrap="wrap">
            <Text size="sm">{entry.actor_login}</Text>
            {entry.actor_type !== 'ADMIN' && (
              <Badge size="xs" variant="outline" color="gray">
                {entry.actor_type.toLowerCase()}
              </Badge>
            )}
          </Group>
        ),
      },
      {
        key: 'action',
        title: t.audit.columns.action,
        minWidth: 160,
        priority: 1,
        render: (entry) => auditActionLabel(entry, t),
      },
      {
        key: 'details',
        title: t.audit.columns.details,
        minWidth: 240,
        priority: 3,
        render: (entry) => <AuditDetailsPreview entry={entry} />,
      },
    ],
    [t],
  );

  return (
    <div className="tvx-listpage">
      <PageHeader page={t.pages.audit} />

      <div className="tvx-toolbar">
        <SearchInput value={list.query} onChange={list.setQuery} placeholder={t.audit.searchPlaceholder} />
        {list.isFiltered && (
          <Button variant="subtle" color="gray" leftSection={<IconFilterOff size={16} />} onClick={list.reset}>
            {t.table.reset}
          </Button>
        )}
        <div className="tvx-toolbar__end">
          <Button
            variant="default"
            leftSection={<IconRefresh size={16} />}
            loading={isFetching && !isLoading}
            onClick={() => void refetch()}
          >
            {t.common.refresh}
          </Button>
        </div>
      </div>

      <ListTable
        fill
        tableId="audit.list"
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(entry) => entry.id}
        onRowClick={setOpened}
        isInitialLoading={isLoading}
        isLoadingNewArgs={isFetching && !currentData && !isLoading}
        error={error}
        onRetry={() => void refetch()}
        isRetrying={isFetching}
        emptyText={t.audit.nothingYet}
        isFiltered={list.isFiltered}
        onResetFilters={list.reset}
      />
      <TablePagination
        total={data?.total ?? 0}
        page={list.page}
        size={list.size}
        onPage={list.setPage}
        onSize={list.setSize}
        disabled={isFetching && !currentData}
      />

      <AuditEntryCardModal entry={opened} onClose={() => setOpened(null)} />
    </div>
  );
}
