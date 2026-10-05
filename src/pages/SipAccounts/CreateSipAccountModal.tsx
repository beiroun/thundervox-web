// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useState, type FormEvent } from 'react';
import { Alert, Button, Group, Modal, PasswordInput, SegmentedControl, Stack, Switch, Text, TextInput } from '@mantine/core';

import { describeApiError } from '@/api/baseQuery';
import { useCreateSipAccountMutation } from '@/api/sipAccountsApi';
import type { SipAccountCredentials, SipAccountKind } from '@/api/types';

interface CreateSipAccountModalProps {
  opened: boolean;
  onClose: () => void;
  onCreated: (credentials: SipAccountCredentials) => void;
}

const generatedRangeHint: Record<SipAccountKind, string> = {
  PANEL: 'The server picks the next free panel number (2xxxxxxx).',
  CLIENT: 'The server picks the next free client number (1xxxxxxx).',
};

/**
 * New SIP number. The normal way is to let the server pick both the number and the password; typing either is
 * allowed for numbers that must match an existing device configuration.
 */
export function CreateSipAccountModal({ opened, onClose, onCreated }: CreateSipAccountModalProps) {
  const [createSipAccount, { isLoading, error, reset }] = useCreateSipAccountMutation();
  const [kind, setKind] = useState<SipAccountKind>('PANEL');
  const [name, setName] = useState('');
  const [numberTyped, setNumberTyped] = useState(false);
  const [number, setNumber] = useState('');
  const [passwordTyped, setPasswordTyped] = useState(false);
  const [password, setPassword] = useState('');

  const close = () => {
    setKind('PANEL');
    setName('');
    setNumberTyped(false);
    setNumber('');
    setPasswordTyped(false);
    setPassword('');
    reset();
    onClose();
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const credentials = await createSipAccount({
        kind,
        name: name.trim(),
        username: numberTyped ? number.trim() : undefined,
        password: passwordTyped ? password : undefined,
      }).unwrap();
      close();
      onCreated(credentials);
    } catch {
      // Rendered from the mutation state below
    }
  };

  return (
    <Modal opened={opened} onClose={close} title="New SIP number">
      <form onSubmit={submit}>
        <Stack gap="md">
          <SegmentedControl
            fullWidth
            value={kind}
            onChange={(value) => setKind(value as SipAccountKind)}
            data={[
              { value: 'PANEL', label: 'Panel' },
              { value: 'CLIENT', label: 'App client' },
            ]}
          />
          <TextInput
            label="Name"
            description="Any text, Russian or Latin - shown in the console and later as the caller name"
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
            maxLength={128}
            required
            data-autofocus
          />

          <Switch
            label="Type the number by hand"
            checked={numberTyped}
            onChange={(event) => setNumberTyped(event.currentTarget.checked)}
          />
          {numberTyped ? (
            <TextInput
              label="Number"
              description="Digits only, 2 to 16"
              value={number}
              onChange={(event) => setNumber(event.currentTarget.value)}
              inputMode="numeric"
              required
            />
          ) : (
            <Text size="sm" c="dimmed">
              {generatedRangeHint[kind]}
            </Text>
          )}

          <Switch
            label="Type the password by hand"
            checked={passwordTyped}
            onChange={(event) => setPasswordTyped(event.currentTarget.checked)}
          />
          {passwordTyped ? (
            <PasswordInput
              label="Password"
              description="8 to 64 characters: latin letters, digits and symbols, no spaces"
              value={password}
              onChange={(event) => setPassword(event.currentTarget.value)}
              autoComplete="new-password"
              required
            />
          ) : (
            <Text size="sm" c="dimmed">
              The server generates a 16-character password and shows it once.
            </Text>
          )}

          {error && <Alert color="red">{describeApiError(error)}</Alert>}
          <Group justify="flex-end">
            <Button variant="default" onClick={close} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" loading={isLoading}>
              Create
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
