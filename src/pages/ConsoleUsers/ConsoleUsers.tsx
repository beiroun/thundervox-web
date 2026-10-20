// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useCallback, useMemo, useState } from 'react';
import { Button, Group, Text } from '@mantine/core';
import { IconFilterOff, IconPlus } from '@tabler/icons-react';

import { useListConsoleUsersQuery } from '@/api/consoleUsersApi';
import type { ConsoleUser, ConsoleUserCredentials } from '@/api/types';
import type { TableColumn } from '@/components/AdaptiveTable/tableColumns';
import {
  IssuedCredentialsModal,
  type IssuedCredentialField,
} from '@/components/IssuedCredentialsModal/IssuedCredentialsModal';
import { ListTable } from '@/components/ListTable/ListTable';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { RoleBadge, RoleLegend } from '@/components/RoleBadge/RoleBadge';
import { SearchInput } from '@/components/SearchInput/SearchInput';
import { TablePagination } from '@/components/TablePagination/TablePagination';
import { localeOf } from '@/i18n/dict';
import { useLang } from '@/i18n/LangContext';
import { ConsoleUserFlags, ConsoleUserStatusBadge } from '@/pages/ConsoleUsers/ConsoleUserBadges';
import { CreateConsoleUserModal } from '@/pages/ConsoleUsers/CreateConsoleUserModal';
import { rowComparator } from '@/shared/columnSort';
import { consoleRoleAbbreviations, consoleRoleRank, manageableRoles } from '@/shared/consoleRoles';
import { consoleUserPath } from '@/shared/navigation';
import { formatServerTime } from '@/shared/serverTime';
import { smartSearchDocument } from '@/shared/smartQuery';
import { useClientList } from '@/shared/useClientList';
import { useListUrlState } from '@/shared/useListUrlState';
import { useAppSelector } from '@/store/store';

const exactKeysOf = (user: ConsoleUser) => [user.login];

/**
 * Console users. A row opens the user's card, where administrators manage readers and the super administrator
 * manages readers and administrators; the super administrator's own record comes from the server environment and
 * is read-only. Creating a user stays on the list.
 */
export function ConsoleUsers() {
  const { t, lang } = useLang();
  const me = useAppSelector((state) => state.auth.user);
  const grantableRoles = me ? manageableRoles(me.role) : [];
  const { data: users, isLoading, isFetching, error, refetch } = useListConsoleUsersQuery();
  const list = useListUrlState();

  const [creating, setCreating] = useState(false);
  const [issued, setIssued] = useState<IssuedCredentialField[] | null>(null);

  const columns = useMemo<TableColumn<ConsoleUser>[]>(
    () => [
      {
        key: 'login',
        title: t.consoleUsers.columns.login,
        minWidth: 120,
        priority: 1,
        render: (user) => (
          <Group gap={8} wrap="wrap">
            <Text size="sm">{user.login}</Text>
            <ConsoleUserFlags user={user} isMe={user.id === me?.id} />
          </Group>
        ),
        sortValue: (user) => user.login,
      },
      {
        key: 'role',
        title: t.consoleUsers.columns.role,
        width: 72,
        minWidth: 70,
        priority: 1,
        render: (user) => <RoleBadge role={user.role} />,
        sortValue: (user) => consoleRoleRank(user.role),
      },
      {
        key: 'status',
        title: t.consoleUsers.columns.status,
        // «ЗАБЛОКИРОВАН» is 120px with the badge's padding, the cell adds 20
        width: 144,
        minWidth: 144,
        priority: 1,
        render: (user) => <ConsoleUserStatusBadge user={user} />,
        sortValue: (user) => (user.enabled ? 1 : 0),
      },
      {
        key: 'passwordChanged',
        title: t.consoleUsers.columns.passwordChanged,
        width: 190,
        priority: 3,
        render: (user) => formatServerTime(user.password_changed_at),
        sortValue: (user) => user.password_changed_at,
      },
      {
        key: 'created',
        title: t.consoleUsers.columns.created,
        width: 190,
        priority: 4,
        render: (user) => formatServerTime(user.created_at),
        sortValue: (user) => user.created_at,
      },
    ],
    [me?.id, t],
  );

  // The role is found by its abbreviation and by its full name in the language on screen
  const searchDocumentOf = useCallback(
    (user: ConsoleUser) =>
      smartSearchDocument(user.login, consoleRoleAbbreviations[user.role], t.roles.titles[user.role]),
    [t],
  );
  const compare = useMemo(() => rowComparator(columns, list.sort, localeOf(lang)), [columns, list.sort, lang]);
  const shown = useClientList(users, { query: list.query, searchDocumentOf, exactKeysOf, compare });

  const showIssued = (credentials: ConsoleUserCredentials) => {
    if (credentials.generated_password) {
      setIssued([
        { label: t.consoleUsers.credentials.login, value: credentials.user.login },
        { label: t.consoleUsers.credentials.password, value: credentials.generated_password },
      ]);
    }
  };

  return (
    <div className="tvx-listpage">
      <PageHeader
        page={t.pages.consoleUsers}
        actions={
          grantableRoles.length > 0 && (
            <Button leftSection={<IconPlus size={16} />} onClick={() => setCreating(true)}>
              {t.consoleUsers.newUser}
            </Button>
          )
        }
      />

      <div className="tvx-toolbar">
        <SearchInput value={list.query} onChange={list.setQuery} placeholder={t.consoleUsers.searchPlaceholder} />
        {list.isFiltered && (
          <Button variant="subtle" color="gray" leftSection={<IconFilterOff size={16} />} onClick={list.reset}>
            {t.table.reset}
          </Button>
        )}
        <div className="tvx-toolbar__end">
          <RoleLegend />
        </div>
      </div>

      <ListTable
        fill
        tableId="console-users.list"
        columns={columns}
        rows={shown.rows}
        rowKey={(user) => user.id}
        rowHref={(user) => consoleUserPath(user.id)}
        sort={list.sort}
        onSort={list.toggleSort}
        isInitialLoading={isLoading}
        error={error}
        onRetry={() => void refetch()}
        isRetrying={isFetching}
        emptyText={t.consoleUsers.nothingYet}
        isFiltered={list.isFiltered}
        onResetFilters={list.reset}
      />
      <TablePagination total={shown.total} />

      <CreateConsoleUserModal
        opened={creating}
        grantableRoles={grantableRoles}
        onClose={() => setCreating(false)}
        onCreated={showIssued}
      />
      <IssuedCredentialsModal
        fields={issued}
        title={t.consoleUsers.issuedCreated}
        containsGeneratedPassword
        onClose={() => setIssued(null)}
      />
    </div>
  );
}
