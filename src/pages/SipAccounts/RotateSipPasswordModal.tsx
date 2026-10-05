// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useState, type FormEvent } from 'react';
import { Alert, Button, Group, Modal, PasswordInput, Stack, Switch, Text } from '@mantine/core';

import { describeApiError } from '@/api/baseQuery';
import { useRotateSipAccountPasswordMutation } from '@/api/sipAccountsApi';
import type { SipAccount, SipAccountCredentials } from '@/api/types';

interface RotateSipPasswordModalProps {
  /** null = closed. */
  account: SipAccount | null;
  onClose: () => void;
  onRotated: (credentials: SipAccountCredentials) => void;
}

/** Replaces the password of a number; the device must get the new one before its next registration. */
export function RotateSipPasswordModal({ account, onClose, onRotated }: RotateSipPasswordModalProps) {
  return (
    <Modal opened={account !== null} onClose={onClose} title={`New password for ${account?.username ?? ''}`}>
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
        <Text size="sm">
          The old password stops working at the device's next registration. Until it gets the new password, the
          device cannot register or call.
        </Text>
        <Switch
          label="Type the password by hand"
          checked={passwordTyped}
          onChange={(event) => setPasswordTyped(event.currentTarget.checked)}
        />
        {passwordTyped && (
          <PasswordInput
            label="Password"
            description="8 to 64 characters: latin letters, digits and symbols, no spaces"
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
            autoComplete="new-password"
            required
          />
        )}
        {error && <Alert color="red">{describeApiError(error)}</Alert>}
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" color="orange" loading={isLoading}>
            Replace password
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
