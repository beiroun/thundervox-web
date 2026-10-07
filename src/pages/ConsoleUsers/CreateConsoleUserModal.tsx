// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useState, type FormEvent } from 'react';
import { Alert, Button, Group, Modal, PasswordInput, Select, Stack, Switch, Text, TextInput } from '@mantine/core';

import { describeApiError } from '@/api/baseQuery';
import { useCreateConsoleUserMutation } from '@/api/consoleUsersApi';
import type { ConsoleRole, ConsoleUserCredentials } from '@/api/types';
import { useLang } from '@/i18n/LangContext';
import { consoleRoleAbbreviations } from '@/shared/consoleRoles';

interface CreateConsoleUserModalProps {
  opened: boolean;
  /** Roles the acting user may hand out; the first one is preselected. */
  grantableRoles: ConsoleRole[];
  onClose: () => void;
  onCreated: (credentials: ConsoleUserCredentials) => void;
}

/** New console user with a role the acting user is allowed to grant. */
export function CreateConsoleUserModal({ opened, grantableRoles, onClose, onCreated }: CreateConsoleUserModalProps) {
  const { t } = useLang();
  const copy = t.consoleUsers.create;
  const [createConsoleUser, { isLoading, error, reset }] = useCreateConsoleUserMutation();
  const [login, setLogin] = useState('');
  const [role, setRole] = useState<ConsoleRole | null>(null);
  const [passwordTyped, setPasswordTyped] = useState(false);
  const [password, setPassword] = useState('');

  const selectedRole = role ?? grantableRoles[0] ?? null;

  const close = () => {
    setLogin('');
    setRole(null);
    setPasswordTyped(false);
    setPassword('');
    reset();
    onClose();
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedRole) {
      return;
    }
    try {
      const credentials = await createConsoleUser({
        login: login.trim(),
        role: selectedRole,
        password: passwordTyped ? password : undefined,
      }).unwrap();
      close();
      onCreated(credentials);
    } catch {
      // Rendered from the mutation state below
    }
  };

  return (
    <Modal opened={opened} onClose={close} title={copy.title}>
      <form onSubmit={submit}>
        <Stack gap="md">
          <TextInput
            label={copy.login}
            description={copy.loginHint}
            value={login}
            onChange={(event) => setLogin(event.currentTarget.value)}
            autoComplete="off"
            required
            data-autofocus
          />
          <Select
            label={copy.role}
            data={grantableRoles.map((grantable) => ({
              value: grantable,
              label: `${consoleRoleAbbreviations[grantable]} – ${t.roles.titles[grantable]}`,
            }))}
            value={selectedRole}
            onChange={(value) => setRole(value as ConsoleRole | null)}
            allowDeselect={false}
            required
          />
          <Switch
            label={t.common.typePasswordByHand}
            checked={passwordTyped}
            onChange={(event) => setPasswordTyped(event.currentTarget.checked)}
          />
          {passwordTyped ? (
            <PasswordInput
              label={t.common.password}
              description={copy.passwordHint}
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
              autoComplete="new-password"
              required
            />
          ) : (
            <Text size="sm" c="dimmed">
              {copy.generatedPasswordHint}
            </Text>
          )}
          {error && <Alert color="red">{describeApiError(error, t.api)}</Alert>}
          <Group justify="flex-end">
            <Button variant="default" onClick={close} disabled={isLoading}>
              {t.common.cancel}
            </Button>
            <Button type="submit" loading={isLoading} disabled={!selectedRole}>
              {t.common.create}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
