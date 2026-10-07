// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useMemo, useState } from 'react';
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Code,
  Group,
  Loader,
  Menu,
  SegmentedControl,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { IconDots, IconKey, IconLock, IconLockOpen, IconPencil, IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';

import { describeApiError } from '@/api/baseQuery';
import {
  useDeleteSipAccountMutation,
  useListSipAccountsQuery,
  useSetSipAccountBlockedMutation,
} from '@/api/sipAccountsApi';
import type { SipAccount, SipAccountCredentials, SipAccountKind } from '@/api/types';
import { ConfirmActionModal } from '@/components/ConfirmActionModal/ConfirmActionModal';
import {
  IssuedCredentialsModal,
  type IssuedCredentialField,
} from '@/components/IssuedCredentialsModal/IssuedCredentialsModal';
import { PageHeader } from '@/components/PageHeader/PageHeader';
import { useLang } from '@/i18n/LangContext';
import { CreateSipAccountModal } from '@/pages/SipAccounts/CreateSipAccountModal';
import { EditSipAccountModal } from '@/pages/SipAccounts/EditSipAccountModal';
import { RotateSipPasswordModal } from '@/pages/SipAccounts/RotateSipPasswordModal';
import { SipAccountStatusBadge } from '@/pages/SipAccounts/SipAccountStatusBadge';
import { sipCredentialFields } from '@/pages/SipAccounts/sipAccountCredentials';
import { mayChangeSipAccounts } from '@/shared/consoleRoles';
import { formatServerTime } from '@/shared/serverTime';
import { useAppSelector } from '@/store/store';

type KindFilter = SipAccountKind | 'ALL';

/** Panels in the accent, app clients in the navy - the two brand colours tell the kinds apart. */
const kindColors: Record<SipAccountKind, string> = { PANEL: 'accent', CLIENT: 'brand' };

/** Online state comes from the core's registrations; re-read often enough to watch a device come up. */
const statusRefreshMs = 15_000;

type OpenDialog =
  | { type: 'create' }
  | { type: 'edit'; account: SipAccount }
  | { type: 'password'; account: SipAccount }
  | { type: 'block'; account: SipAccount }
  | { type: 'delete'; account: SipAccount }
  | null;

/** SIP numbers of panels and app clients: who exists, who is online, and - for administrators - the changes. */
export function SipAccounts() {
  const { t } = useLang();
  const role = useAppSelector((state) => state.auth.user?.role);
  const canChange = role !== undefined && mayChangeSipAccounts(role);
  const { data: accounts, isLoading, error } = useListSipAccountsQuery(undefined, { pollingInterval: statusRefreshMs });
  const [setBlocked, blockState] = useSetSipAccountBlockedMutation();
  const [deleteSipAccount, deleteState] = useDeleteSipAccountMutation();

  const [kindFilter, setKindFilter] = useState<KindFilter>('ALL');
  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState<OpenDialog>(null);
  const [issued, setIssued] = useState<{ title: string; fields: IssuedCredentialField[]; generated: boolean } | null>(null);

  const visibleAccounts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (accounts ?? []).filter(
      (account) =>
        (kindFilter === 'ALL' || account.kind === kindFilter) &&
        (query === '' ||
          account.username.includes(query) ||
          account.name.toLowerCase().includes(query) ||
          (account.external_id ?? '').toLowerCase().includes(query)),
    );
  }, [accounts, kindFilter, search]);

  const showIssued = (title: string) => (credentials: SipAccountCredentials) =>
    setIssued({
      title,
      fields: sipCredentialFields(credentials, t.sipAccounts.credentials),
      generated: credentials.generated_password !== null,
    });

  const closeDialog = () => {
    blockState.reset();
    deleteState.reset();
    setDialog(null);
  };

  const confirmBlock = async (account: SipAccount) => {
    try {
      await setBlocked({ id: account.id, blocked: true }).unwrap();
      closeDialog();
    } catch {
      // Rendered inside the dialog
    }
  };

  const confirmDelete = async (account: SipAccount) => {
    try {
      await deleteSipAccount(account.id).unwrap();
      closeDialog();
    } catch {
      // Rendered inside the dialog
    }
  };

  return (
    <Stack gap="lg">
      <PageHeader
        page={t.pages.sipAccounts}
        actions={
          canChange && (
            <Button leftSection={<IconPlus size={16} />} onClick={() => setDialog({ type: 'create' })}>
              {t.sipAccounts.newNumber}
            </Button>
          )
        }
      />

      <Group>
        <SegmentedControl
          value={kindFilter}
          onChange={(value) => setKindFilter(value as KindFilter)}
          data={[
            { value: 'ALL', label: t.sipAccounts.filterAll },
            { value: 'PANEL', label: t.sipAccounts.filterPanels },
            { value: 'CLIENT', label: t.sipAccounts.filterClients },
          ]}
        />
        <TextInput
          placeholder={t.sipAccounts.searchPlaceholder}
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          w={280}
        />
      </Group>

      {isLoading && <Loader size="sm" />}
      {error && <Alert color="red">{describeApiError(error, t.api)}</Alert>}
      {/* Unblocking runs without a dialog, so its failure is reported on the page */}
      {blockState.isError && dialog === null && <Alert color="red">{describeApiError(blockState.error, t.api)}</Alert>}

      {accounts && (
        <Table.ScrollContainer minWidth={1040}>
            <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t.sipAccounts.columns.number}</Table.Th>
                <Table.Th>{t.sipAccounts.columns.name}</Table.Th>
                <Table.Th>{t.sipAccounts.columns.externalId}</Table.Th>
                <Table.Th>{t.sipAccounts.columns.kind}</Table.Th>
                <Table.Th>{t.sipAccounts.columns.status}</Table.Th>
                <Table.Th>{t.sipAccounts.columns.device}</Table.Th>
                {canChange && <Table.Th w={48} />}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {visibleAccounts.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={canChange ? 7 : 6}>
                    <Text c="dimmed" size="sm">
                      {accounts.length === 0 ? t.sipAccounts.noNumbersYet : t.sipAccounts.nothingMatches}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
              {visibleAccounts.map((account) => (
                <Table.Tr key={account.id}>
                  <Table.Td>
                    <Code fz="sm">{account.username}</Code>
                  </Table.Td>
                  <Table.Td>{account.name}</Table.Td>
                  <Table.Td>
                    {account.external_id ? (
                      <Code fz="sm">{account.external_id}</Code>
                    ) : (
                      <Text size="sm" c="dimmed">
                        {t.common.none}
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="outline" color={kindColors[account.kind]}>
                      {t.sipAccounts.kinds[account.kind]}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <SipAccountStatusBadge account={account} />
                  </Table.Td>
                  <Table.Td>
                    {account.registration ? (
                      <Stack gap={0}>
                        <Text size="sm">{account.registration.user_agent || t.common.none}</Text>
                        <Text size="xs" c="dimmed">
                          {account.registration.received ?? account.registration.contact} · {t.sipAccounts.seen}{' '}
                          {formatServerTime(account.registration.last_seen_at)}
                        </Text>
                      </Stack>
                    ) : (
                      <Text size="sm" c="dimmed">
                        {t.sipAccounts.neverRegistered}
                      </Text>
                    )}
                  </Table.Td>
                  {canChange && (
                    <Table.Td>
                      <SipAccountActions
                        account={account}
                        onEdit={() => setDialog({ type: 'edit', account })}
                        onRotatePassword={() => setDialog({ type: 'password', account })}
                        onBlock={() => setDialog({ type: 'block', account })}
                        onUnblock={() => void setBlocked({ id: account.id, blocked: false })}
                        onDelete={() => setDialog({ type: 'delete', account })}
                      />
                    </Table.Td>
                  )}
                </Table.Tr>
              ))}
            </Table.Tbody>
            </Table>
        </Table.ScrollContainer>
      )}

      <CreateSipAccountModal
        opened={dialog?.type === 'create'}
        onClose={closeDialog}
        onCreated={showIssued(t.sipAccounts.issuedCreated)}
      />
      <EditSipAccountModal account={dialog?.type === 'edit' ? dialog.account : null} onClose={closeDialog} />
      <RotateSipPasswordModal
        account={dialog?.type === 'password' ? dialog.account : null}
        onClose={closeDialog}
        onRotated={showIssued(t.sipAccounts.issuedPasswordReplaced)}
      />
      <ConfirmActionModal
        opened={dialog?.type === 'block'}
        title={t.sipAccounts.blockTitle(dialog?.type === 'block' ? dialog.account.username : '')}
        confirmLabel={t.common.block}
        loading={blockState.isLoading}
        error={blockState.isError ? describeApiError(blockState.error, t.api) : null}
        onConfirm={() => dialog?.type === 'block' && void confirmBlock(dialog.account)}
        onClose={closeDialog}
      >
        {t.sipAccounts.blockBody}
      </ConfirmActionModal>
      <ConfirmActionModal
        opened={dialog?.type === 'delete'}
        title={t.sipAccounts.deleteTitle(dialog?.type === 'delete' ? dialog.account.username : '')}
        confirmLabel={t.common.delete}
        loading={deleteState.isLoading}
        error={deleteState.isError ? describeApiError(deleteState.error, t.api) : null}
        onConfirm={() => dialog?.type === 'delete' && void confirmDelete(dialog.account)}
        onClose={closeDialog}
      >
        {t.sipAccounts.deleteBody}
      </ConfirmActionModal>
      <IssuedCredentialsModal
        fields={issued?.fields ?? null}
        title={issued?.title ?? ''}
        containsGeneratedPassword={issued?.generated ?? false}
        onClose={() => setIssued(null)}
      />
    </Stack>
  );
}

interface SipAccountActionsProps {
  account: SipAccount;
  onEdit: () => void;
  onRotatePassword: () => void;
  onBlock: () => void;
  onUnblock: () => void;
  onDelete: () => void;
}

function SipAccountActions({ account, onEdit, onRotatePassword, onBlock, onUnblock, onDelete }: SipAccountActionsProps) {
  const { t } = useLang();

  return (
    <Menu position="bottom-end" withinPortal>
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray" aria-label={t.common.actionsFor(account.username)}>
          <IconDots size={18} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item leftSection={<IconPencil size={16} />} onClick={onEdit}>
          {t.sipAccounts.actions.editDetails}
        </Menu.Item>
        <Menu.Item leftSection={<IconKey size={16} />} onClick={onRotatePassword}>
          {t.common.newPassword}
        </Menu.Item>
        {account.enabled ? (
          <Menu.Item leftSection={<IconLock size={16} />} onClick={onBlock}>
            {t.common.block}
          </Menu.Item>
        ) : (
          <Menu.Item leftSection={<IconLockOpen size={16} />} onClick={onUnblock}>
            {t.common.unblock}
          </Menu.Item>
        )}
        <Menu.Divider />
        <Menu.Item color="red" leftSection={<IconTrash size={16} />} onClick={onDelete}>
          {t.common.delete}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
