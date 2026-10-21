// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useMemo, useState } from 'react';
import { Button, SegmentedControl, Select, Switch, Text } from '@mantine/core';
import { IconFilterOff, IconRefresh } from '@tabler/icons-react';

import { useGetEventsQuery } from '@/api/eventsApi';
import type { ServerEvent, ServerEventCategory } from '@/api/types';
import type { TableColumn } from '@/components/AdaptiveTable/tableColumns';
import { ListTable } from '@/components/ListTable/ListTable';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { SearchInput } from '@/components/SearchInput/SearchInput';
import { ServerTimeCell } from '@/components/ServerTimeCell/ServerTimeCell';
import { TablePagination } from '@/components/TablePagination/TablePagination';
import { useLang } from '@/i18n/LangContext';
import {
  EventDetailsCell,
  EventOutcomeBadge,
  EventPartiesCell,
  EventWhatCell,
} from '@/pages/Events/eventPresentation';
import { ServerEventCardModal, type RelatedEvents } from '@/pages/Events/ServerEventCardModal';
import { mayViewIntegration } from '@/shared/consoleRoles';
import { sendableSearchQuery } from '@/shared/smartQuery';
import { useIsPhone } from '@/shared/useIsPhone';
import { useListUrlState } from '@/shared/useListUrlState';
import { useServerPageClamp } from '@/shared/useServerPageClamp';
import { useAppSelector } from '@/store/store';

/** The log follows the server on its first page; deeper pages hold still while they are read. */
const liveRefreshMs = 10_000;

const filterKeys = ['category', 'problems'] as const;

/** The value of the "problems only" switch in the address. */
const problemsOn = '1';

/** Pushes and API calls are the Integration side: the same roles see them here as there (the server decides). */
function visibleCategories(mayViewIntegrationSide: boolean): ServerEventCategory[] {
  return mayViewIntegrationSide ? ['REGISTRATION', 'CALL', 'PUSH', 'SERVICE_CALL'] : ['REGISTRATION', 'CALL'];
}

/**
 * What happens on the server, newest first: numbers coming online and going offline, calls and where they ended,
 * wake pushes and whether the operator's backend took them, the backends' calls to the service API. One journal or
 * all of them, everything or only what did not get through, the smart search over every journal; the server pages
 * and searches, so the columns keep its order. A line opens its card with every field and the way to the rest of
 * the log about the same number, call or backend.
 */
export function Events() {
  const { t } = useLang();
  const copy = t.events;
  const isPhone = useIsPhone();
  const role = useAppSelector((state) => state.auth.user?.role);
  const categories = visibleCategories(role !== undefined && mayViewIntegration(role));
  const list = useListUrlState({ filterKeys });
  const category = categories.find((value) => value === list.filters.category);
  const problems = list.filters.problems === problemsOn;
  const isFirstPage = list.page === 0;

  const { data, currentData, isLoading, isFetching, error, refetch } = useGetEventsQuery(
    { page: list.page, size: list.size, category, problems, query: sendableSearchQuery(list.query) },
    { refetchOnMountOrArgChange: true, pollingInterval: isFirstPage ? liveRefreshMs : 0, skipPollingIfUnfocused: true },
  );
  const [refreshing, setRefreshing] = useState(false);
  const [openedKey, setOpenedKey] = useState<string | null>(null);
  const [openedSnapshot, setOpenedSnapshot] = useState<ServerEvent | null>(null);
  useServerPageClamp(data?.total, list.page, list.size, list.setPage);

  // A call in progress changes while its card is open: the card follows the line, and keeps the last copy if the
  // line has scrolled off the page
  const opened = openedKey === null ? null : (data?.items.find((event) => event.key === openedKey) ?? openedSnapshot);

  const open = (event: ServerEvent) => {
    setOpenedKey(event.key);
    setOpenedSnapshot(event);
  };
  const close = () => {
    setOpenedKey(null);
    setOpenedSnapshot(null);
  };
  const showRelated = ({ query, category: relatedCategory }: RelatedEvents) => {
    close();
    list.select(query, { category: relatedCategory });
  };
  const refresh = () => {
    setRefreshing(true);
    void refetch().finally(() => setRefreshing(false));
  };

  const columns = useMemo<TableColumn<ServerEvent>[]>(
    () => [
      {
        key: 'time',
        title: copy.columns.time,
        width: 170,
        // The date over the time, as the cell wraps them on a phone
        minWidth: 96,
        priority: 1,
        render: (event) => <ServerTimeCell value={event.occurred_at} />,
      },
      {
        key: 'event',
        title: copy.columns.event,
        width: 200,
        priority: 2,
        render: (event) => <EventWhatCell event={event} />,
      },
      {
        key: 'parties',
        title: copy.columns.parties,
        width: 230,
        // Two numbers with an arrow wrap onto two lines; a single number still fits
        minWidth: 104,
        priority: 1,
        render: (event) => <EventPartiesCell event={event} />,
      },
      {
        key: 'outcome',
        title: copy.columns.outcome,
        width: 180,
        // «511 · ОШИБКА ЗАПРОСА» is the longest badge; on a phone it shortens with an ellipsis
        minWidth: 120,
        priority: 1,
        render: (event) => <EventOutcomeBadge event={event} />,
      },
      {
        key: 'details',
        title: copy.columns.details,
        minWidth: 220,
        priority: 3,
        render: (event) => <EventDetailsCell event={event} />,
      },
    ],
    [copy],
  );

  const categoryOptions = [
    { value: 'ALL', label: copy.filterAll },
    ...categories.map((value) => ({ value, label: copy.categories[value] })),
  ];
  const setCategory = (value: string | null) =>
    list.setFilter('category', value && value !== 'ALL' ? value : undefined);

  return (
    <div className="tvx-listpage">
      <PageHeader page={t.pages.events} />

      <div className="tvx-toolbar">
        {isPhone ? (
          <Select
            data={categoryOptions}
            value={category ?? 'ALL'}
            onChange={setCategory}
            allowDeselect={false}
            aria-label={copy.columns.event}
            w="100%"
          />
        ) : (
          <SegmentedControl data={categoryOptions} value={category ?? 'ALL'} onChange={setCategory} />
        )}
        <Switch
          label={copy.problemsOnly}
          checked={problems}
          onChange={(change) => list.setFilter('problems', change.currentTarget.checked ? problemsOn : undefined)}
        />
        <SearchInput value={list.query} onChange={list.setQuery} placeholder={copy.searchPlaceholder} />
        {list.isFiltered && (
          <Button variant="subtle" color="gray" leftSection={<IconFilterOff size={16} />} onClick={list.reset}>
            {t.table.reset}
          </Button>
        )}
        <div className="tvx-toolbar__end">
          {isFirstPage && (
            <Text size="sm" c="dimmed">
              {copy.live}
            </Text>
          )}
          <Button variant="default" leftSection={<IconRefresh size={16} />} loading={refreshing} onClick={refresh}>
            {t.common.refresh}
          </Button>
        </div>
      </div>

      <ListTable
        fill
        tableId="events.list"
        columns={columns}
        rows={data?.items ?? []}
        rowKey={(event) => event.key}
        onRowClick={open}
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

      <ServerEventCardModal event={opened} onClose={close} onShowRelated={showRelated} />
    </div>
  );
}
