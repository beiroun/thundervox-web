// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useState } from 'react';
import { ActionIcon, Alert, Badge, Button, Group, Loader, Menu, Stack, Table, Text, Title, Tooltip } from '@mantine/core';
import { IconDots, IconKey, IconLock, IconLockOpen, IconPlus, IconServerCog, IconUserCog } from '@tabler/icons-react';

import { describeApiError } from '@/api/baseQuery';
import { useListConsoleUsersQuery, useUpdateConsoleUserMutation } from '@/api/consoleUsersApi';
import type { ConsoleRole, ConsoleUser, ConsoleUserCredentials } from '@/api/types';
import { useAppSelector } from '@/store/store';
import { consoleRoleColors, consoleRoleTitles, manageableRoles } from '@/shared/consoleRoles';
import { formatServerTime } from '@/shared/serverTime';
import {
  IssuedCredentialsModal,
  type IssuedCredentialField,
} from '@/components/IssuedCredentialsModal/IssuedCredentialsModal';
import { CreateConsoleUserModal } from '@/pages/ConsoleUsers/CreateConsoleUserModal';
import { ResetConsolePasswordModal } from '@/pages/ConsoleUsers/ResetConsolePasswordModal';

/**
 * Console users. Administrators manage readers; the super administrator manages readers and administrators. The
 * super administrator's own row comes from the server environment and is read-only here.
 */
export function ConsoleUsers() {
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
          { label: 'Login', value: credentials.user.login },
          { label: 'Password', value: credentials.generated_password },
        ],
      });
    }
  };

  const mayManage = (user: ConsoleUser) => !user.managed_by_environment && grantableRoles.includes(user.role);

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>Console users</Title>
        {grantableRoles.length > 0 && (
          <Button leftSection={<IconPlus size={16} />} onClick={() => setCreating(true)}>
            New user
          </Button>
        )}
      </Group>

      {isLoading && <Loader size="sm" />}
      {error && <Alert color="red">{describeApiError(error)}</Alert>}
      {updateState.isError && <Alert color="red">{describeApiError(updateState.error)}</Alert>}

      {users && (
        <Table striped highlightOnHover verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Login</Table.Th>
              <Table.Th>Role</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Created</Table.Th>
              <Table.Th>Password changed</Table.Th>
              <Table.Th w={48} />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {users.map((user) => (
              <Table.Tr key={user.id}>
                <Table.Td>
                  <Text size="sm" fw={user.id === me?.id ? 700 : 400}>
                    {user.login}
                    {user.id === me?.id && ' (you)'}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge variant="light" color={consoleRoleColors[user.role]}>
                    {consoleRoleTitles[user.role]}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  {user.enabled ? (
                    <Badge color="teal" variant="light">
                      Active
                    </Badge>
                  ) : (
                    <Badge color="red" variant="light">
                      Blocked
                    </Badge>
                  )}
                </Table.Td>
                <Table.Td>{formatServerTime(user.created_at)}</Table.Td>
                <Table.Td>{formatServerTime(user.password_changed_at)}</Table.Td>
                <Table.Td>
                  {user.managed_by_environment ? (
                    <Tooltip label="Defined by the server environment (TVX_SUPERADMIN_*)">
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
      )}

      <CreateConsoleUserModal
        opened={creating}
        grantableRoles={grantableRoles}
        onClose={() => setCreating(false)}
        onCreated={showIssued('User created')}
      />
      <ResetConsolePasswordModal
        user={resettingFor}
        onClose={() => setResettingFor(null)}
        onReset={showIssued('Password replaced')}
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
  return (
    <Menu position="bottom-end" withinPortal>
      <Menu.Target>
        <ActionIcon variant="subtle" aria-label={`Actions for ${user.login}`}>
          <IconDots size={18} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        {assignableRoles.map((role) => (
          <Menu.Item key={role} leftSection={<IconUserCog size={16} />} onClick={() => onChangeRole(role)}>
            Make {consoleRoleTitles[role].toLowerCase()}
          </Menu.Item>
        ))}
        <Menu.Item leftSection={<IconKey size={16} />} onClick={onResetPassword}>
          New password
        </Menu.Item>
        {user.enabled ? (
          <Menu.Item color="red" leftSection={<IconLock size={16} />} onClick={() => onSetEnabled(false)}>
            Block
          </Menu.Item>
        ) : (
          <Menu.Item leftSection={<IconLockOpen size={16} />} onClick={() => onSetEnabled(true)}>
            Unblock
          </Menu.Item>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
