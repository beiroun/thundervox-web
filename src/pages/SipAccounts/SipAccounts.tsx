// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useCallback, useMemo, useState } from 'react';
import { Badge, Button, Code, SegmentedControl, Stack, Text } from '@mantine/core';
import { IconFilterOff, IconPlus } from '@tabler/icons-react';

import { useListSipAccountsQuery } from '@/api/sipAccountsApi';
import type { SipAccount, SipAccountCredentials, SipAccountKind } from '@/api/types';
import type { TableColumn } from '@/components/AdaptiveTable/tableColumns';
import {
  IssuedCredentialsModal,
  type IssuedCredentialField,
} from '@/components/IssuedCredentialsModal/IssuedCredentialsModal';
import { ListTable } from '@/components/ListTable/ListTable';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { SearchInput } from '@/components/SearchInput/SearchInput';
import { TablePagination } from '@/components/TablePagination/TablePagination';
import { localeOf } from '@/i18n/dict';
import { useLang } from '@/i18n/LangContext';
import { CreateSipAccountModal } from '@/pages/SipAccounts/CreateSipAccountModal';
import { SipAccountStatusBadge, sipAccountStatusRank } from '@/pages/SipAccounts/SipAccountStatusBadge';
import { sipCredentialFields } from '@/pages/SipAccounts/sipAccountCredentials';
import { sipKindColors } from '@/pages/SipAccounts/sipKindColors';
import { rowComparator } from '@/shared/columnSort';
import { mayChangeSipAccounts } from '@/shared/consoleRoles';
import { sipAccountPath } from '@/shared/navigation';
import { formatServerTime } from '@/shared/serverTime';
import { smartSearchDocument } from '@/shared/smartQuery';
import { useClientList } from '@/shared/useClientList';
import { useListUrlState } from '@/shared/useListUrlState';
import { useAppSelector } from '@/store/store';

/** Online state comes from the server's registration journal; re-read often enough to watch a device come up. */
const statusRefreshMs = 15_000;

const filterKeys = ['kind'] as const;

const kindOf = (value: string | undefined): SipAccountKind | undefined =>
  value === 'PANEL' || value === 'CLIENT' ? value : undefined;

const searchDocumentOf = (account: SipAccount) =>
  smartSearchDocument(
    account.username,
    account.name,
    account.external_id,
    account.registration?.user_agent,
    account.registration?.received,
    account.registration?.contact,
  );

const exactKeysOf = (account: SipAccount) => [account.username, account.external_id];

/** When the number was last seen online: now-ish while online, the last sample after it went away. */
const lastSeenOf = (account: SipAccount) => account.registration?.last_online_at ?? null;

/**
 * SIP numbers of panels and app clients: who exists and who is online. A row opens the number's card, where every
 * change lives; creating a number stays on the list.
 */
export function SipAccounts() {
  const { t, lang } = useLang();
  const role = useAppSelector((state) => state.auth.user?.role);
  const canChange = role !== undefined && mayChangeSipAccounts(role);
  const { data: accounts, isLoading, isFetching, error, refetch } = useListSipAccountsQuery(undefined, {
    pollingInterval: statusRefreshMs,
  });
  const list = useListUrlState({ filterKeys });
  const kind = kindOf(list.filters.kind);

  const [creating, setCreating] = useState(false);
  const [issued, setIssued] = useState<{ fields: IssuedCredentialField[]; generated: boolean } | null>(null);

  const columns = useMemo<TableColumn<SipAccount>[]>(
    () => [
      {
        key: 'number',
        title: t.sipAccounts.columns.number,
        width: 100,
        // Eight digits in the code chip on one line
        minWidth: 92,
        priority: 1,
        render: (account) => <Code fz="sm">{account.username}</Code>,
        sortValue: (account) => account.username,
      },
      {
        key: 'name',
        title: t.sipAccounts.columns.name,
        minWidth: 100,
        priority: 1,
        render: (account) => account.name,
        sortValue: (account) => account.name,
      },
      {
        key: 'externalId',
        title: t.sipAccounts.columns.externalId,
        width: 200,
        priority: 4,
        render: (account) =>
          account.external_id ? (
            <Code fz="sm">{account.external_id}</Code>
          ) : (
            <Text size="sm" c="dimmed">
              {t.common.none}
            </Text>
          ),
        sortValue: (account) => account.external_id,
      },
      {
        key: 'kind',
        title: t.sipAccounts.columns.kind,
        width: 130,
        priority: 2,
        render: (account) => (
          <Badge variant="outline" color={sipKindColors[account.kind]}>
            {t.sipAccounts.kinds[account.kind]}
          </Badge>
        ),
        sortValue: (account) => t.sipAccounts.kinds[account.kind],
      },
      {
        key: 'status',
        title: t.sipAccounts.columns.status,
        // «ЗАБЛОКИРОВАН» is 120px with the badge's padding, the cell adds 20
        width: 144,
        minWidth: 144,
        priority: 1,
        render: (account) => <SipAccountStatusBadge account={account} />,
        sortValue: sipAccountStatusRank,
      },
      {
        key: 'device',
        title: t.sipAccounts.columns.device,
        minWidth: 220,
        priority: 3,
        render: (account) => <RegistrationSummary account={account} />,
        sortValue: lastSeenOf,
      },
    ],
    [t],
  );

  const matches = useCallback((account: SipAccount) => !kind || account.kind === kind, [kind]);
  const compare = useMemo(() => rowComparator(columns, list.sort, localeOf(lang)), [columns, list.sort, lang]);
  const shown = useClientList(accounts, {
    query: list.query,
    searchDocumentOf,
    exactKeysOf,
    matches,
    compare,
    page: list.page,
    size: list.size,
  });

  const showIssued = (credentials: SipAccountCredentials) =>
    setIssued({
      fields: sipCredentialFields(credentials, t.sipAccounts.credentials),
      generated: credentials.generated_password !== null,
    });

  return (
    <div className="tvx-listpage">
      <PageHeader
        page={t.pages.sipAccounts}
        actions={
          canChange && (
            <Button leftSection={<IconPlus size={16} />} onClick={() => setCreating(true)}>
              {t.sipAccounts.newNumber}
            </Button>
          )
        }
      />

      <div className="tvx-toolbar">
        <SegmentedControl
          value={kind ?? 'ALL'}
          onChange={(value) => list.setFilter('kind', kindOf(value))}
          data={[
            { value: 'ALL', label: t.sipAccounts.filterAll },
            { value: 'PANEL', label: t.sipAccounts.filterPanels },
            { value: 'CLIENT', label: t.sipAccounts.filterClients },
          ]}
        />
        <SearchInput value={list.query} onChange={list.setQuery} placeholder={t.sipAccounts.searchPlaceholder} />
        {list.isFiltered && (
          <Button variant="subtle" color="gray" leftSection={<IconFilterOff size={16} />} onClick={list.reset}>
            {t.table.reset}
          </Button>
        )}
      </div>

      <ListTable
        fill
        tableId="sip-accounts.list"
        columns={columns}
        rows={shown.rows}
        rowKey={(account) => account.id}
        rowHref={(account) => sipAccountPath(account.id)}
        sort={list.sort}
        onSort={list.toggleSort}
        isInitialLoading={isLoading}
        error={error}
        onRetry={() => void refetch()}
        isRetrying={isFetching}
        emptyText={t.sipAccounts.noNumbersYet}
        isFiltered={list.isFiltered}
        onResetFilters={list.reset}
      />
      <TablePagination
        total={shown.total}
        page={shown.page}
        size={list.size}
        onPage={list.setPage}
        onSize={list.setSize}
      />

      <CreateSipAccountModal opened={creating} onClose={() => setCreating(false)} onCreated={showIssued} />
      <IssuedCredentialsModal
        fields={issued?.fields ?? null}
        title={t.sipAccounts.issuedCreated}
        containsGeneratedPassword={issued?.generated ?? false}
        onClose={() => setIssued(null)}
      />
    </div>
  );
}

/** The device a number is seen from, with where and since when; a number that never registered says so. */
function RegistrationSummary({ account }: { account: SipAccount }) {
  const { t } = useLang();
  const registration = account.registration;

  if (!registration) {
    return (
      <Text size="sm" c="dimmed">
        {t.sipAccounts.neverRegistered}
      </Text>
    );
  }
  return (
    <Stack gap={0}>
      <Text size="sm">
        {registration.user_agent || t.common.none}
        {registration.online && registration.contacts > 1 && (
          <Text span size="xs" c="dimmed">
            {' · '}
            {t.sipAccounts.devices(registration.contacts)}
          </Text>
        )}
      </Text>
      <Text size="xs" c="dimmed">
        {registration.received ?? registration.contact ?? t.common.none}
        {' · '}
        {registration.online
          ? `${t.sipAccounts.since} ${formatServerTime(registration.online_since)}`
          : `${t.sipAccounts.lastOnline} ${formatServerTime(registration.last_online_at)}`}
      </Text>
    </Stack>
  );
}
