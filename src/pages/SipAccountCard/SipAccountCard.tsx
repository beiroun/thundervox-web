// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useState } from 'react';
import { Alert, Badge, Button, Group, Loader, Menu, Text } from '@mantine/core';
import { IconKey, IconLock, IconLockOpen, IconPencil, IconTrash } from '@tabler/icons-react';
import { Link, useNavigate, useParams } from 'react-router';

import { describeApiError } from '@/api/baseQuery';
import {
  useDeleteSipAccountMutation,
  useGetSipAccountQuery,
  useSetSipAccountBlockedMutation,
} from '@/api/sipAccountsApi';
import type { SipAccount, SipAccountCredentials } from '@/api/types';
import { ConfirmActionModal } from '@/components/ConfirmActionModal/ConfirmActionModal';
import { CardField, CardFields, CopyableValue } from '@/components/EntityCard/CardFields';
import { EntityActionsMenu } from '@/components/EntityCard/EntityActionsMenu';
import { EntityCardHeader } from '@/components/EntityCard/EntityCardHeader';
import {
  IssuedCredentialsModal,
  type IssuedCredentialField,
} from '@/components/IssuedCredentialsModal/IssuedCredentialsModal';
import { useLang } from '@/i18n/LangContext';
import { EditSipAccountModal } from '@/pages/SipAccounts/EditSipAccountModal';
import { RotateSipPasswordModal } from '@/pages/SipAccounts/RotateSipPasswordModal';
import { SipAccountStatusBadge } from '@/pages/SipAccounts/SipAccountStatusBadge';
import { sipCredentialFields } from '@/pages/SipAccounts/sipAccountCredentials';
import { sipKindColors } from '@/pages/SipAccounts/sipKindColors';
import { isNotFound } from '@/shared/apiErrors';
import { mayChangeSipAccounts } from '@/shared/consoleRoles';
import { eventsSearchPath, routePaths } from '@/shared/navigation';
import { formatServerTime } from '@/shared/serverTime';
import { useGoBack } from '@/shared/useGoBack';
import { useAppSelector } from '@/store/store';

/** The card follows the registration journal like the list does. */
const statusRefreshMs = 15_000;

type OpenDialog = 'edit' | 'password' | 'block' | 'delete' | null;

/**
 * One SIP number: what it is, how it is registered, and – for administrators – every change of it in the
 * "Actions" menu: name and external id, a new password, block or unblock, delete.
 */
export function SipAccountCard() {
  const { t } = useLang();
  const { id: idParam } = useParams();
  const id = Number(idParam);
  const validId = Number.isInteger(id) && id > 0;
  const goBack = useGoBack(routePaths.sipAccounts);
  const { data: account, isLoading, isFetching, error, refetch } = useGetSipAccountQuery(id, {
    skip: !validId,
    pollingInterval: statusRefreshMs,
  });

  if (!validId || (error && isNotFound(error))) {
    return (
      <>
        <EntityCardHeader kicker={t.pages.sipAccount.kicker} title={idParam ?? ''} onBack={goBack} />
        <Alert color="gray" title={t.sipAccountCard.notFoundTitle}>
          <Text size="sm" mb="sm">
            {t.sipAccountCard.notFoundBody}
          </Text>
          <Button size="xs" variant="default" onClick={goBack}>
            {t.common.toList}
          </Button>
        </Alert>
      </>
    );
  }
  if (isLoading) {
    return <Loader size="sm" />;
  }
  if (!account) {
    return (
      <>
        <EntityCardHeader kicker={t.pages.sipAccount.kicker} title={idParam ?? ''} onBack={goBack} />
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
      </>
    );
  }
  return <SipAccountCardContent account={account} onBack={goBack} />;
}

function SipAccountCardContent({ account, onBack }: { account: SipAccount; onBack: () => void }) {
  const { t } = useLang();
  const navigate = useNavigate();
  const role = useAppSelector((state) => state.auth.user?.role);
  const canChange = role !== undefined && mayChangeSipAccounts(role);
  const [setBlocked, blockState] = useSetSipAccountBlockedMutation();
  const [deleteSipAccount, deleteState] = useDeleteSipAccountMutation();
  const [dialog, setDialog] = useState<OpenDialog>(null);
  const [issued, setIssued] = useState<{ fields: IssuedCredentialField[]; generated: boolean } | null>(null);
  const copy = t.sipAccountCard;
  const registration = account.registration;

  const closeDialog = () => {
    blockState.reset();
    deleteState.reset();
    setDialog(null);
  };

  const showIssued = (credentials: SipAccountCredentials) =>
    setIssued({
      fields: sipCredentialFields(credentials, t.sipAccounts.credentials),
      generated: credentials.generated_password !== null,
    });

  const confirmBlock = async () => {
    try {
      await setBlocked({ id: account.id, blocked: true }).unwrap();
      closeDialog();
    } catch {
      // Rendered inside the dialog
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteSipAccount(account.id).unwrap();
      // The card has nothing left to show: back to the list, not to a page that would answer "not found"
      void navigate(routePaths.sipAccounts, { replace: true });
    } catch {
      // Rendered inside the dialog
    }
  };

  const actions = canChange && (
    <EntityActionsMenu>
      <Menu.Item leftSection={<IconPencil size={16} />} onClick={() => setDialog('edit')}>
        {t.sipAccounts.actions.editDetails}
      </Menu.Item>
      <Menu.Item leftSection={<IconKey size={16} />} onClick={() => setDialog('password')}>
        {t.common.newPassword}
      </Menu.Item>
      {account.enabled ? (
        <Menu.Item leftSection={<IconLock size={16} />} onClick={() => setDialog('block')}>
          {t.common.block}
        </Menu.Item>
      ) : (
        <Menu.Item
          leftSection={<IconLockOpen size={16} />}
          onClick={() => void setBlocked({ id: account.id, blocked: false })}
        >
          {t.common.unblock}
        </Menu.Item>
      )}
      <Menu.Divider />
      <Menu.Item color="red" leftSection={<IconTrash size={16} />} onClick={() => setDialog('delete')}>
        {t.common.delete}
      </Menu.Item>
    </EntityActionsMenu>
  );

  return (
    <>
      <EntityCardHeader
        kicker={`${t.pages.sipAccount.kicker} · ${t.sipAccounts.kinds[account.kind]}`}
        title={account.username}
        badges={
          <>
            <Badge variant="outline" color={sipKindColors[account.kind]}>
              {t.sipAccounts.kinds[account.kind]}
            </Badge>
            <SipAccountStatusBadge account={account} />
          </>
        }
        subtitle={[account.name, account.external_id].filter(Boolean).join(' · ')}
        actions={actions}
        onBack={onBack}
      />

      {/* Unblocking runs without a dialog, so its failure is reported on the card */}
      {blockState.isError && dialog === null && (
        <Alert color="red" mb="md">
          {describeApiError(blockState.error, t.api)}
        </Alert>
      )}

      <section className="tvx-section">
        <h2 className="tvx-section__title">{copy.numberSection}</h2>
        <CardFields>
          <CardField label={t.sipAccounts.columns.number}>
            <CopyableValue value={account.username} label={t.sipAccounts.columns.number} />
          </CardField>
          <CardField label={t.sipAccounts.columns.name}>{account.name}</CardField>
          <CardField label={t.sipAccounts.columns.externalId}>
            {account.external_id && (
              <CopyableValue value={account.external_id} label={t.sipAccounts.columns.externalId} />
            )}
          </CardField>
          <CardField label={t.sipAccounts.columns.kind}>{t.sipAccounts.kinds[account.kind]}</CardField>
          <CardField label={copy.access}>{account.enabled ? copy.accessOpen : t.sipAccounts.status.blocked}</CardField>
          <CardField label={copy.created}>{formatServerTime(account.created_at)}</CardField>
          <CardField label={copy.passwordRotated}>{formatServerTime(account.password_rotated_at)}</CardField>
        </CardFields>
      </section>

      <section className="tvx-section">
        <h2 className="tvx-section__title">{copy.registrationSection}</h2>
        {registration ? (
          <CardFields>
            <CardField label={t.sipAccounts.columns.status}>
              {registration.online ? t.sipAccounts.status.online : t.sipAccounts.status.offline}
            </CardField>
            <CardField label={copy.devicesNow}>{registration.online ? registration.contacts : 0}</CardField>
            <CardField label={copy.userAgent}>{registration.user_agent}</CardField>
            <CardField label={copy.received}>{registration.received}</CardField>
            <CardField label={copy.contact} wide>
              {registration.contact}
            </CardField>
            <CardField label={copy.onlineSince}>
              {registration.online ? formatServerTime(registration.online_since) : null}
            </CardField>
            <CardField label={copy.lastOnline}>{formatServerTime(registration.last_online_at)}</CardField>
            <CardField label={copy.lastOffline}>
              {registration.last_offline_at ? formatServerTime(registration.last_offline_at) : null}
            </CardField>
          </CardFields>
        ) : (
          <Text c="dimmed">{copy.neverRegistered}</Text>
        )}
        <Text size="sm" mt="md">
          <Link to={eventsSearchPath(account.username)} className="tvx-link">
            {copy.eventsLink}
          </Link>
        </Text>
      </section>

      <EditSipAccountModal account={dialog === 'edit' ? account : null} onClose={closeDialog} />
      <RotateSipPasswordModal
        account={dialog === 'password' ? account : null}
        onClose={closeDialog}
        onRotated={showIssued}
      />
      <ConfirmActionModal
        opened={dialog === 'block'}
        title={t.sipAccounts.blockTitle(account.username)}
        confirmLabel={t.common.block}
        loading={blockState.isLoading}
        error={blockState.isError ? describeApiError(blockState.error, t.api) : null}
        onConfirm={() => void confirmBlock()}
        onClose={closeDialog}
      >
        {t.sipAccounts.blockBody}
      </ConfirmActionModal>
      <ConfirmActionModal
        opened={dialog === 'delete'}
        title={t.sipAccounts.deleteTitle(account.username)}
        confirmLabel={t.common.delete}
        loading={deleteState.isLoading}
        error={deleteState.isError ? describeApiError(deleteState.error, t.api) : null}
        onConfirm={() => void confirmDelete()}
        onClose={closeDialog}
      >
        {t.sipAccounts.deleteBody}
      </ConfirmActionModal>
      <IssuedCredentialsModal
        fields={issued?.fields ?? null}
        title={t.sipAccounts.issuedPasswordReplaced}
        containsGeneratedPassword={issued?.generated ?? false}
        onClose={() => setIssued(null)}
      />
    </>
  );
}
