// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useMemo, useState } from 'react';
import { Badge, Button, Group, Text } from '@mantine/core';
import { IconFilterOff, IconRefresh } from '@tabler/icons-react';

import { useGetPushDeliveriesQuery } from '@/api/integrationApi';
import type { PushDelivery } from '@/api/types';
import type { TableColumn } from '@/components/AdaptiveTable/tableColumns';
import { ListTable } from '@/components/ListTable/ListTable';
import { SearchInput } from '@/components/SearchInput/SearchInput';
import { TablePagination } from '@/components/TablePagination/TablePagination';
import { useLang } from '@/i18n/LangContext';
import { DeliveryCardModal, DeliveryParty } from '@/pages/Integration/DeliveryCardModal';
import { outcomeColor } from '@/pages/Integration/outcomeColor';
import { ServerTimeCell } from '@/components/ServerTimeCell/ServerTimeCell';
import { sendableSearchQuery } from '@/shared/smartQuery';
import { useListUrlState } from '@/shared/useListUrlState';
import { useServerPageClamp } from '@/shared/useServerPageClamp';

/** A page of the log is a part of a longer page: a shorter default than a list of its own. */
const defaultPageSize = 25;

/**
 * What happened to every wake push, newest first. The server pages and searches the log, so the columns keep its
 * own order; a row opens the delivery's card with the full response or error.
 */
export function DeliveryLogSection() {
  const { t } = useLang();
  const copy = t.integration.deliveries;
  const list = useListUrlState({ prefix: 'deliveries_', defaultSize: defaultPageSize });
  const { data, currentData, isLoading, isFetching, error, refetch } = useGetPushDeliveriesQuery(
    { page: list.page, size: list.size, query: sendableSearchQuery(list.query) },
    { refetchOnMountOrArgChange: true },
  );
  const [opened, setOpened] = useState<PushDelivery | null>(null);
  useServerPageClamp(data?.total, list.page, list.size, list.setPage);

  const columns = useMemo<TableColumn<PushDelivery>[]>(
    () => [
      {
        key: 'time',
        title: copy.columns.time,
        width: 170,
        // The date over the time, as the cell wraps them on a phone
        minWidth: 96,
        priority: 1,
        render: (delivery) => <ServerTimeCell value={delivery.created_at} />,
      },
      {
        key: 'kind',
        title: copy.columns.kind,
        width: 100,
        priority: 4,
        render: (delivery) => (
          <Badge size="xs" variant="outline" color={delivery.kind === 'TEST' ? 'brand' : 'gray'}>
            {copy.kinds[delivery.kind]}
          </Badge>
        ),
      },
      {
        key: 'from',
        title: copy.columns.from,
        width: 150,
        priority: 3,
        render: (delivery) => <DeliveryParty number={delivery.caller_number} externalId={delivery.caller_external_id} />,
      },
      {
        key: 'to',
        title: copy.columns.to,
        width: 150,
        priority: 1,
        render: (delivery) => <DeliveryParty number={delivery.callee_number} externalId={delivery.callee_external_id} />,
      },
      {
        key: 'outcome',
        title: copy.columns.outcome,
        width: 140,
        // «НЕ ДОСТАВЛЕН» is 115px with the badge's padding, the cell adds 20
        minWidth: 136,
        priority: 1,
        render: (delivery) => (
          <Badge color={outcomeColor(delivery.outcome)} variant="light">
            {copy.outcomes[delivery.outcome]}
          </Badge>
        ),
      },
      {
        key: 'status',
        title: copy.columns.status,
        width: 80,
        priority: 4,
        render: (delivery) => delivery.http_status ?? t.common.none,
      },
      {
        key: 'duration',
        title: copy.columns.duration,
        width: 110,
        priority: 5,
        render: (delivery) => delivery.duration_ms ?? t.common.none,
      },
      {
        key: 'details',
        title: copy.columns.details,
        minWidth: 200,
        priority: 3,
        render: (delivery) => {
          const details = delivery.error ?? delivery.response_excerpt ?? '';
          return (
            <Text size="sm" c={delivery.error ? 'red' : undefined} lineClamp={2}>
              {details || t.common.none}
            </Text>
          );
        },
      },
    ],
    [copy, t],
  );

  return (
    <section className="tvx-section">
      <Group justify="space-between" align="flex-start" wrap="wrap" mb="md">
        <div>
          <h2 className="tvx-section__title" style={{ marginBottom: 8 }}>
            {copy.title}
          </h2>
          <Text size="sm" c="dimmed" maw={720}>
            {copy.lede}
          </Text>
        </div>
        <Button
          variant="default"
          leftSection={<IconRefresh size={16} />}
          loading={isFetching && !isLoading}
          onClick={() => void refetch()}
        >
          {copy.refresh}
        </Button>
      </Group>

      <div className="tvx-toolbar">
        <SearchInput value={list.query} onChange={list.setQuery} placeholder={copy.searchPlaceholder} />
        {list.isFiltered && (
          <Button variant="subtle" color="gray" leftSection={<IconFilterOff size={16} />} onClick={list.reset}>
            {t.table.reset}
          </Button>
        )}
      </div>

      <ListTable
        tableId="integration.deliveries"
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(delivery) => delivery.id}
        onRowClick={setOpened}
        isInitialLoading={isLoading}
        isLoadingNewArgs={isFetching && !currentData && !isLoading}
        error={error}
        onRetry={() => void refetch()}
        isRetrying={isFetching}
        emptyText={copy.nothingYet}
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

      <DeliveryCardModal delivery={opened} onClose={() => setOpened(null)} />
    </section>
  );
}
