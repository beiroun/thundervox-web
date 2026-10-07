// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useState } from 'react';
import { ActionIcon, Alert, Badge, Button, Loader, Menu, Stack, Table, Text, Tooltip } from '@mantine/core';
import { IconDots, IconKey, IconLock, IconLockOpen, IconPlus, IconServerCog, IconUserCog } from '@tabler/icons-react';

import { describeApiError } from '@/api/baseQuery';
import { useListConsoleUsersQuery, useUpdateConsoleUserMutation } from '@/api/consoleUsersApi';
import type { ConsoleRole, ConsoleUser, ConsoleUserCredentials } from '@/api/types';
import {
  IssuedCredentialsModal,
  type IssuedCredentialField,
} from '@/components/IssuedCredentialsModal/IssuedCredentialsModal';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { RoleBadge, RoleLegend } from '@/components/RoleBadge/RoleBadge';
import { useLang } from '@/i18n/LangContext';
import { CreateConsoleUserModal } from '@/pages/ConsoleUsers/CreateConsoleUserModal';
import { ResetConsolePasswordModal } from '@/pages/ConsoleUsers/ResetConsolePasswordModal';
import { manageableRoles } from '@/shared/consoleRoles';
import { formatServerTime } from '@/shared/serverTime';
import { useAppSelector } from '@/store/store';

/**
 * Console users. Administrators manage readers; the super administrator manages readers and administrators. The
 * super administrator's own row comes from the server environment and is read-only here.
 */
export function ConsoleUsers() {
  const { t } = useLang();
  const me = useAppSelector((state) => state.auth.user);
  const grantableRoles = me ? manageableRoles(me.role) : [];
  const { data: users, isLoading, error } = useListConsoleUsersQuery();
  const [updateConsoleUser, updateState] = useUpdateConsoleUserMutation();

  const [creating, setCreating] = useState(false);
  const [resettingFor, setResettingFor] = useState<ConsoleUser | null>(null);
  const [issued, setIssued] = useState<{ title: string; fields: IssuedCredentialField[] } | null>(null);

  const showIssued = (title: string) => (credentials: ConsoleUserCredentials) => {
    if (credentials.generated_password) {
      setIssued({
        title,
        fields: [
          { label: t.consoleUsers.credentials.login, value: credentials.user.login },
          { label: t.consoleUsers.credentials.password, value: credentials.generated_password },
        ],
      });
    }
  };

  const mayManage = (user: ConsoleUser) => !user.managed_by_environment && grantableRoles.includes(user.role);

  return (
    <Stack gap="lg">
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

      <RoleLegend />

      {isLoading && <Loader size="sm" />}
      {error && <Alert color="red">{describeApiError(error, t.api)}</Alert>}
      {updateState.isError && <Alert color="red">{describeApiError(updateState.error, t.api)}</Alert>}

      {users && (
        <Table.ScrollContainer minWidth={760}>
            <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t.consoleUsers.columns.login}</Table.Th>
                <Table.Th>{t.consoleUsers.columns.role}</Table.Th>
                <Table.Th>{t.consoleUsers.columns.status}</Table.Th>
                <Table.Th>{t.consoleUsers.columns.created}</Table.Th>
                <Table.Th>{t.consoleUsers.columns.passwordChanged}</Table.Th>
                <Table.Th w={48} />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {users.map((user) => (
                <Table.Tr key={user.id}>
                  <Table.Td>
                    <Text size="sm">
                      {user.login}
                      {user.id === me?.id && (
                        <Text component="span" size="sm" c="dimmed">
                          {' '}
                          {t.consoleUsers.you}
                        </Text>
                      )}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <RoleBadge role={user.role} />
                  </Table.Td>
                  <Table.Td>
                    {user.enabled ? (
                      <Badge color="teal" variant="light">
                        {t.consoleUsers.status.active}
                      </Badge>
                    ) : (
                      <Badge color="red" variant="light">
                        {t.consoleUsers.status.blocked}
                      </Badge>
                    )}
                  </Table.Td>
                  <Table.Td>{formatServerTime(user.created_at)}</Table.Td>
                  <Table.Td>{formatServerTime(user.password_changed_at)}</Table.Td>
                  <Table.Td>
                    {user.managed_by_environment ? (
                      <Tooltip label={t.consoleUsers.environmentManaged}>
                        <IconServerCog size={18} opacity={0.6} />
                      </Tooltip>
                    ) : (
                      mayManage(user) && (
                        <ConsoleUserActions
                          user={user}
                          assignableRoles={grantableRoles.filter((grantable) => grantable !== user.role)}
                          onChangeRole={(role) => void updateConsoleUser({ id: user.id, role })}
                          onSetEnabled={(enabled) => void updateConsoleUser({ id: user.id, enabled })}
                          onResetPassword={() => setResettingFor(user)}
                        />
                      )
                    )}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
            </Table>
        </Table.ScrollContainer>
      )}

      <CreateConsoleUserModal
        opened={creating}
        grantableRoles={grantableRoles}
        onClose={() => setCreating(false)}
        onCreated={showIssued(t.consoleUsers.issuedCreated)}
      />
      <ResetConsolePasswordModal
        user={resettingFor}
        onClose={() => setResettingFor(null)}
        onReset={showIssued(t.consoleUsers.issuedPasswordReplaced)}
      />
      <IssuedCredentialsModal
        fields={issued?.fields ?? null}
        title={issued?.title ?? ''}
        containsGeneratedPassword
        onClose={() => setIssued(null)}
      />
    </Stack>
  );
}

interface ConsoleUserActionsProps {
  user: ConsoleUser;
  /** Roles the user can be switched to by the acting user (current role excluded). */
  assignableRoles: ConsoleRole[];
  onChangeRole: (role: ConsoleRole) => void;
  onSetEnabled: (enabled: boolean) => void;
  onResetPassword: () => void;
}

function ConsoleUserActions({ user, assignableRoles, onChangeRole, onSetEnabled, onResetPassword }: ConsoleUserActionsProps) {
  const { t } = useLang();

  return (
    <Menu position="bottom-end" withinPortal>
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray" aria-label={t.common.actionsFor(user.login)}>
          <IconDots size={18} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {assignableRoles.map((role) => (
          <Menu.Item key={role} leftSection={<IconUserCog size={16} />} onClick={() => onChangeRole(role)}>
            {t.roles.makeRole(t.roles.titles[role])}
          </Menu.Item>
        ))}
        <Menu.Item leftSection={<IconKey size={16} />} onClick={onResetPassword}>
          {t.common.newPassword}
        </Menu.Item>
        {user.enabled ? (
          <Menu.Item color="red" leftSection={<IconLock size={16} />} onClick={() => onSetEnabled(false)}>
            {t.common.block}
          </Menu.Item>
        ) : (
          <Menu.Item leftSection={<IconLockOpen size={16} />} onClick={() => onSetEnabled(true)}>
            {t.common.unblock}
          </Menu.Item>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
