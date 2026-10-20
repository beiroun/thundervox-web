// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useMemo, useState } from 'react';
import { Button, Code, Group, Text } from '@mantine/core';
import { IconFilterOff, IconPlus } from '@tabler/icons-react';

import { useListServiceTokensQuery } from '@/api/integrationApi';
import type { IssuedServiceToken, ServiceToken } from '@/api/types';
import type { TableColumn } from '@/components/AdaptiveTable/tableColumns';
import { IssuedCredentialsModal } from '@/components/IssuedCredentialsModal/IssuedCredentialsModal';
import { ListTable } from '@/components/ListTable/ListTable';
import { SearchInput } from '@/components/SearchInput/SearchInput';
import { TablePagination } from '@/components/TablePagination/TablePagination';
import { localeOf } from '@/i18n/dict';
import { useLang } from '@/i18n/LangContext';
import { IssueServiceTokenModal } from '@/pages/Integration/IssueServiceTokenModal';
import { ServiceTokenCardModal } from '@/pages/Integration/ServiceTokenCardModal';
import { ServiceTokenStatusBadge } from '@/pages/Integration/ServiceTokenStatusBadge';
import { rowComparator } from '@/shared/columnSort';
import { formatServerTime } from '@/shared/serverTime';
import { smartSearchDocument } from '@/shared/smartQuery';
import { useClientList } from '@/shared/useClientList';
import { useListUrlState } from '@/shared/useListUrlState';

const searchDocumentOf = (token: ServiceToken) => smartSearchDocument(token.name, token.token_prefix, token.created_by);

const exactKeysOf = (token: ServiceToken) => [token.name, token.token_prefix];

/** Service API tokens: a table and "new token"; a row opens the token's card, where it is revoked. */
export function ServiceTokensSection({ mayChange }: { mayChange: boolean }) {
  const { t, lang } = useLang();
  const copy = t.integration.tokens;
  const { data: tokens, isLoading, isFetching, error, refetch } = useListServiceTokensQuery();
  const list = useListUrlState({ prefix: 'tokens_' });
  const [creating, setCreating] = useState(false);
  const [issued, setIssued] = useState<IssuedServiceToken | null>(null);
  const [openedId, setOpenedId] = useState<number | null>(null);
  // The card reads the token from the list, so a revoke shows in it at once
  const opened = tokens?.find((token) => token.id === openedId) ?? null;

  const columns = useMemo<TableColumn<ServiceToken>[]>(
    () => [
      {
        key: 'name',
        title: copy.columns.name,
        minWidth: 180,
        priority: 1,
        render: (token) => token.name,
        sortValue: (token) => token.name,
      },
      {
        key: 'prefix',
        title: copy.columns.prefix,
        width: 170,
        priority: 4,
        render: (token) => <Code fz="sm">{token.token_prefix}…</Code>,
        sortValue: (token) => token.token_prefix,
      },
      {
        key: 'status',
        title: copy.columns.status,
        width: 130,
        priority: 2,
        render: (token) => <ServiceTokenStatusBadge token={token} />,
        sortValue: (token) => (token.enabled ? 1 : 0),
      },
      {
        key: 'lastUsed',
        title: copy.columns.lastUsed,
        width: 180,
        priority: 3,
        render: (token) => (token.last_used_at ? formatServerTime(token.last_used_at) : copy.neverUsed),
        sortValue: (token) => token.last_used_at,
      },
      {
        key: 'created',
        title: copy.columns.created,
        width: 240,
        priority: 4,
        render: (token) => (
          <Text size="sm">
            {formatServerTime(token.created_at)}
            <Text component="span" size="sm" c="dimmed">
              {' · '}
              {token.created_by}
            </Text>
          </Text>
        ),
        sortValue: (token) => token.created_at,
      },
    ],
    [copy],
  );

  const compare = useMemo(() => rowComparator(columns, list.sort, localeOf(lang)), [columns, list.sort, lang]);
  const shown = useClientList(tokens, { query: list.query, searchDocumentOf, exactKeysOf, compare });

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
        {mayChange && (
          <Button leftSection={<IconPlus size={16} />} onClick={() => setCreating(true)}>
            {copy.newToken}
          </Button>
        )}
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
        tableId="integration.tokens"
        columns={columns}
        rows={shown.rows}
        rowKey={(token) => token.id}
        onRowClick={(token) => setOpenedId(token.id)}
        sort={list.sort}
        onSort={list.toggleSort}
        isInitialLoading={isLoading}
        error={error}
        onRetry={() => void refetch()}
        isRetrying={isFetching}
        emptyText={copy.nothingYet}
        isFiltered={list.isFiltered}
        onResetFilters={list.reset}
      />
      <TablePagination total={shown.total} />

      <ServiceTokenCardModal token={opened} mayChange={mayChange} onClose={() => setOpenedId(null)} />
      <IssueServiceTokenModal opened={creating} onClose={() => setCreating(false)} onIssued={setIssued} />
      <IssuedCredentialsModal
        fields={issued ? [{ label: copy.valueLabel, value: issued.value }] : null}
        title={copy.issuedTitle}
        containsGeneratedPassword={false}
        warning={copy.issuedWarning}
        onClose={() => setIssued(null)}
      />
    </section>
  );
}
