// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useState, type FormEvent } from 'react';
import { Alert, Button, Group, Modal, Stack, TextInput } from '@mantine/core';

import { describeApiError } from '@/api/baseQuery';
import { useRenameSipAccountMutation } from '@/api/sipAccountsApi';
import type { SipAccount } from '@/api/types';

interface RenameSipAccountModalProps {
  /** null = closed. */
  account: SipAccount | null;
  onClose: () => void;
}

/** New name for a number; the number itself never changes. */
export function RenameSipAccountModal({ account, onClose }: RenameSipAccountModalProps) {
  return (
    <Modal opened={account !== null} onClose={onClose} title={`Rename ${account?.username ?? ''}`}>
      {/* Keyed by account so the field starts from that account's current name every time */}
      {account && <RenameForm key={account.id} account={account} onClose={onClose} />}
    </Modal>
  );
}

function RenameForm({ account, onClose }: { account: SipAccount; onClose: () => void }) {
  const [renameSipAccount, { isLoading, error }] = useRenameSipAccountMutation();
  const [name, setName] = useState(account.name);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await renameSipAccount({ id: account.id, name: name.trim() }).unwrap();
      onClose();
    } catch {
      // Rendered from the mutation state below
    }
  };

  return (
    <form onSubmit={submit}>
      <Stack gap="md">
        <TextInput
          label="Name"
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
          maxLength={128}
          required
          data-autofocus
        />
        {error && <Alert color="red">{describeApiError(error)}</Alert>}
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            Save
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
