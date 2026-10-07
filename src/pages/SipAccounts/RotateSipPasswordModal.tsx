// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useState, type FormEvent } from 'react';
import { Alert, Button, Group, Modal, PasswordInput, Stack, Switch, Text } from '@mantine/core';

import { describeApiError } from '@/api/baseQuery';
import { useRotateSipAccountPasswordMutation } from '@/api/sipAccountsApi';
import type { SipAccount, SipAccountCredentials } from '@/api/types';
import { useLang } from '@/i18n/LangContext';

interface RotateSipPasswordModalProps {
  /** null = closed. */
  account: SipAccount | null;
  onClose: () => void;
  onRotated: (credentials: SipAccountCredentials) => void;
}

/** Replaces the password of a number; the device must get the new one before its next registration. */
export function RotateSipPasswordModal({ account, onClose, onRotated }: RotateSipPasswordModalProps) {
  const { t } = useLang();

  return (
    <Modal opened={account !== null} onClose={onClose} title={t.sipAccounts.rotate.title(account?.username ?? '')}>
      {account && <RotateForm key={account.id} account={account} onClose={onClose} onRotated={onRotated} />}
    </Modal>
  );
}

function RotateForm({
  account,
  onClose,
  onRotated,
}: {
  account: SipAccount;
  onClose: () => void;
  onRotated: (credentials: SipAccountCredentials) => void;
}) {
  const { t } = useLang();
  const [rotatePassword, { isLoading, error }] = useRotateSipAccountPasswordMutation();
  const [passwordTyped, setPasswordTyped] = useState(false);
  const [password, setPassword] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const credentials = await rotatePassword({ id: account.id, password: passwordTyped ? password : undefined }).unwrap();
      onClose();
      onRotated(credentials);
    } catch {
      // Rendered from the mutation state below
    }
  };

  return (
    <form onSubmit={submit}>
      <Stack gap="md">
        <Text size="sm">{t.sipAccounts.rotate.body}</Text>
        <Switch
          label={t.common.typePasswordByHand}
          checked={passwordTyped}
          onChange={(event) => setPasswordTyped(event.currentTarget.checked)}
        />
        {passwordTyped && (
          <PasswordInput
            label={t.common.password}
            description={t.sipAccounts.create.passwordHint}
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
            autoComplete="new-password"
            required
          />
        )}
        {error && <Alert color="red">{describeApiError(error, t.api)}</Alert>}
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose} disabled={isLoading}>
            {t.common.cancel}
          </Button>
          <Button type="submit" loading={isLoading}>
            {t.common.replacePassword}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
