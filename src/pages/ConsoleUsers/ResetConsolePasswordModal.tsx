// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useState, type FormEvent } from 'react';
import { Alert, Button, Group, Modal, PasswordInput, Stack, Switch, Text } from '@mantine/core';

import { describeApiError } from '@/api/baseQuery';
import { useResetConsoleUserPasswordMutation } from '@/api/consoleUsersApi';
import type { ConsoleUser, ConsoleUserCredentials } from '@/api/types';
import { useLang } from '@/i18n/LangContext';

interface ResetConsolePasswordModalProps {
  /** null = closed. */
  user: ConsoleUser | null;
  onClose: () => void;
  onReset: (credentials: ConsoleUserCredentials) => void;
}

/** New password for a console user; every open session of that user ends with it. */
export function ResetConsolePasswordModal({ user, onClose, onReset }: ResetConsolePasswordModalProps) {
  const { t } = useLang();

  return (
    <Modal opened={user !== null} onClose={onClose} title={t.consoleUsers.reset.title(user?.login ?? '')}>
      {user && <ResetForm key={user.id} user={user} onClose={onClose} onReset={onReset} />}
    </Modal>
  );
}

function ResetForm({
  user,
  onClose,
  onReset,
}: {
  user: ConsoleUser;
  onClose: () => void;
  onReset: (credentials: ConsoleUserCredentials) => void;
}) {
  const { t } = useLang();
  const [resetPassword, { isLoading, error }] = useResetConsoleUserPasswordMutation();
  const [passwordTyped, setPasswordTyped] = useState(false);
  const [password, setPassword] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const credentials = await resetPassword({ id: user.id, password: passwordTyped ? password : undefined }).unwrap();
      onClose();
      onReset(credentials);
    } catch {
      // Rendered from the mutation state below
    }
  };

  return (
    <form onSubmit={submit}>
      <Stack gap="md">
        <Text size="sm">{t.consoleUsers.reset.body(user.login)}</Text>
        <Switch
          label={t.common.typePasswordByHand}
          checked={passwordTyped}
          onChange={(event) => setPasswordTyped(event.currentTarget.checked)}
        />
        {passwordTyped && (
          <PasswordInput
            label={t.common.password}
            description={t.consoleUsers.reset.passwordHint}
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
