// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useState } from 'react';
import { Alert, Button, Group, Loader, Menu, Text } from '@mantine/core';
import { IconKey, IconLock, IconLockOpen, IconUserCog } from '@tabler/icons-react';
import { useParams } from 'react-router';

import { describeApiError } from '@/api/baseQuery';
import { useListConsoleUsersQuery, useUpdateConsoleUserMutation } from '@/api/consoleUsersApi';
import type { ConsoleUser, ConsoleUserCredentials } from '@/api/types';
import { CardField, CardFields } from '@/components/EntityCard/CardFields';
import { EntityActionsMenu } from '@/components/EntityCard/EntityActionsMenu';
import { EntityCardHeader } from '@/components/EntityCard/EntityCardHeader';
import {
  IssuedCredentialsModal,
  type IssuedCredentialField,
} from '@/components/IssuedCredentialsModal/IssuedCredentialsModal';
import { RoleBadge } from '@/components/RoleBadge/RoleBadge';
import { useLang } from '@/i18n/LangContext';
import { ConsoleUserFlags, ConsoleUserStatusBadge } from '@/pages/ConsoleUsers/ConsoleUserBadges';
import { ResetConsolePasswordModal } from '@/pages/ConsoleUsers/ResetConsolePasswordModal';
import { manageableRoles } from '@/shared/consoleRoles';
import { routePaths } from '@/shared/navigation';
import { formatServerTime } from '@/shared/serverTime';
import { useGoBack } from '@/shared/useGoBack';
import { useAppSelector } from '@/store/store';

/**
 * One console user. The server has no single-user read: the card takes the user from the list, which is short
 * and already cached when the card is opened from it.
 */
export function ConsoleUserCard() {
  const { t } = useLang();
  const { id: idParam } = useParams();
  const id = Number(idParam);
  const goBack = useGoBack(routePaths.consoleUsers);
  const { data: users, isLoading, isFetching, error, refetch } = useListConsoleUsersQuery();
  const user = users?.find((candidate) => candidate.id === id);

  if (isLoading) {
    return <Loader size="sm" />;
  }
  if (user) {
    return <ConsoleUserCardContent user={user} onBack={goBack} />;
  }
  return (
    <>
      <EntityCardHeader kicker={t.pages.consoleUser.kicker} title={idParam ?? ''} onBack={goBack} />
      {users ? (
        <Alert color="gray" title={t.consoleUserCard.notFoundTitle}>
          <Text size="sm" mb="sm">
            {t.consoleUserCard.notFoundBody}
          </Text>
          <Button size="xs" variant="default" onClick={goBack}>
            {t.common.toList}
          </Button>
        </Alert>
      ) : (
        <Alert color="red" title={t.table.loadError}>
          <Text size="sm" mb="sm">
            {describeApiError(error, t.api)}
          </Text>
          <Group gap="sm">
            <Button size="xs" variant="default" loading={isFetching} onClick={() => void refetch()}>
              {t.common.retry}
            </Button>
            <Button size="xs" variant="subtle" color="gray" onClick={goBack}>
              {t.common.toList}
            </Button>
          </Group>
        </Alert>
      )}
    </>
  );
}

function ConsoleUserCardContent({ user, onBack }: { user: ConsoleUser; onBack: () => void }) {
  const { t } = useLang();
  const me = useAppSelector((state) => state.auth.user);
  const grantableRoles = me ? manageableRoles(me.role) : [];
  const mayManage = !user.managed_by_environment && grantableRoles.includes(user.role);
  const assignableRoles = grantableRoles.filter((role) => role !== user.role);
  const [updateConsoleUser, updateState] = useUpdateConsoleUserMutation();
  const [resetting, setResetting] = useState(false);
  const [issued, setIssued] = useState<IssuedCredentialField[] | null>(null);
  const copy = t.consoleUserCard;

  const showIssued = (credentials: ConsoleUserCredentials) => {
    if (credentials.generated_password) {
      setIssued([
        { label: t.consoleUsers.credentials.login, value: credentials.user.login },
        { label: t.consoleUsers.credentials.password, value: credentials.generated_password },
      ]);
    }
  };

  const actions = mayManage && (
    <EntityActionsMenu>
      {assignableRoles.map((role) => (
        <Menu.Item
          key={role}
          leftSection={<IconUserCog size={16} />}
          onClick={() => void updateConsoleUser({ id: user.id, role })}
        >
          {t.roles.makeRole(t.roles.titles[role])}
        </Menu.Item>
      ))}
      <Menu.Item leftSection={<IconKey size={16} />} onClick={() => setResetting(true)}>
        {t.common.newPassword}
      </Menu.Item>
      <Menu.Divider />
      {user.enabled ? (
        <Menu.Item
          color="red"
          leftSection={<IconLock size={16} />}
          onClick={() => void updateConsoleUser({ id: user.id, enabled: false })}
        >
          {t.common.block}
        </Menu.Item>
      ) : (
        <Menu.Item
          leftSection={<IconLockOpen size={16} />}
          onClick={() => void updateConsoleUser({ id: user.id, enabled: true })}
        >
          {t.common.unblock}
        </Menu.Item>
      )}
    </EntityActionsMenu>
  );

  return (
    <>
      <EntityCardHeader
        kicker={t.pages.consoleUser.kicker}
        title={user.login}
        badges={
          <>
            <RoleBadge role={user.role} />
            <ConsoleUserStatusBadge user={user} />
            <ConsoleUserFlags user={user} isMe={user.id === me?.id} />
          </>
        }
        subtitle={t.roles.titles[user.role]}
        actions={actions}
        onBack={onBack}
      />

      {updateState.isError && (
        <Alert color="red" mb="md">
          {describeApiError(updateState.error, t.api)}
        </Alert>
      )}

      <section className="tvx-section">
        <h2 className="tvx-section__title">{copy.accountSection}</h2>
        <CardFields>
          <CardField label={t.consoleUsers.columns.login}>{user.login}</CardField>
          <CardField label={t.consoleUsers.columns.role}>{t.roles.titles[user.role]}</CardField>
          <CardField label={t.consoleUsers.columns.status}>
            {user.enabled ? t.consoleUsers.status.active : t.consoleUsers.status.blocked}
          </CardField>
          <CardField label={t.consoleUsers.columns.created}>{formatServerTime(user.created_at)}</CardField>
          <CardField label={t.consoleUsers.columns.passwordChanged}>
            {formatServerTime(user.password_changed_at)}
          </CardField>
          <CardField label={copy.source}>
            {user.managed_by_environment ? t.consoleUsers.environmentManaged : copy.sourceConsole}
          </CardField>
        </CardFields>
      </section>

      <ResetConsolePasswordModal user={resetting ? user : null} onClose={() => setResetting(false)} onReset={showIssued} />
      <IssuedCredentialsModal
        fields={issued}
        title={t.consoleUsers.issuedPasswordReplaced}
        containsGeneratedPassword
        onClose={() => setIssued(null)}
      />
    </>
  );
}
