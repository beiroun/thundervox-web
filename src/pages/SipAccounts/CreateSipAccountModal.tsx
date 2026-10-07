// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useState, type FormEvent } from 'react';
import { Alert, Button, Group, Modal, PasswordInput, SegmentedControl, Stack, Switch, Text, TextInput } from '@mantine/core';

import { describeApiError } from '@/api/baseQuery';
import { useCreateSipAccountMutation } from '@/api/sipAccountsApi';
import type { SipAccountCredentials, SipAccountKind } from '@/api/types';
import { useLang } from '@/i18n/LangContext';

interface CreateSipAccountModalProps {
  opened: boolean;
  onClose: () => void;
  onCreated: (credentials: SipAccountCredentials) => void;
}

/**
 * New SIP number. The normal way is to let the server pick both the number and the password; typing either is
 * allowed for numbers that must match an existing device configuration.
 */
export function CreateSipAccountModal({ opened, onClose, onCreated }: CreateSipAccountModalProps) {
  const { t } = useLang();
  const copy = t.sipAccounts.create;
  const [createSipAccount, { isLoading, error, reset }] = useCreateSipAccountMutation();
  const [kind, setKind] = useState<SipAccountKind>('PANEL');
  const [name, setName] = useState('');
  const [externalId, setExternalId] = useState('');
  const [numberTyped, setNumberTyped] = useState(false);
  const [number, setNumber] = useState('');
  const [passwordTyped, setPasswordTyped] = useState(false);
  const [password, setPassword] = useState('');

  const close = () => {
    setKind('PANEL');
    setName('');
    setExternalId('');
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
        external_id: externalId.trim() === '' ? undefined : externalId.trim(),
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
    <Modal opened={opened} onClose={close} title={copy.title}>
      <form onSubmit={submit}>
        <Stack gap="md">
          <SegmentedControl
            fullWidth
            value={kind}
            onChange={(value) => setKind(value as SipAccountKind)}
            data={[
              { value: 'PANEL', label: t.sipAccounts.kinds.PANEL },
              { value: 'CLIENT', label: t.sipAccounts.kinds.CLIENT },
            ]}
          />
          <TextInput
            label={copy.name}
            description={copy.nameHint}
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
            maxLength={128}
            required
            data-autofocus
          />
          <TextInput
            label={copy.externalId}
            description={copy.externalIdHint[kind]}
            value={externalId}
            onChange={(event) => setExternalId(event.currentTarget.value)}
            maxLength={128}
          />

          <Switch
            label={copy.typeNumberByHand}
            checked={numberTyped}
            onChange={(event) => setNumberTyped(event.currentTarget.checked)}
          />
          {numberTyped ? (
            <TextInput
              label={copy.number}
              description={copy.numberHint}
              value={number}
              onChange={(event) => setNumber(event.currentTarget.value)}
              inputMode="numeric"
              required
            />
          ) : (
            <Text size="sm" c="dimmed">
              {copy.generatedNumberHint[kind]}
            </Text>
          )}

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
            <Button type="submit" loading={isLoading}>
              {t.common.create}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
