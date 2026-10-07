// SPDX-License-Identifier: BUSL-1.1
// Copyright (c) 2026 Andrei Baranov (84softworks). Licensed under the Business Source License 1.1 - see LICENSE.
import { useState, type FormEvent } from 'react';
import { Alert, Button, Group, Modal, Stack, TextInput } from '@mantine/core';

import { describeApiError } from '@/api/baseQuery';
import { useUpdateSipAccountDetailsMutation } from '@/api/sipAccountsApi';
import type { SipAccount } from '@/api/types';
import { externalIdHint } from '@/pages/SipAccounts/CreateSipAccountModal';

interface EditSipAccountModalProps {
  /** null = closed. */
  account: SipAccount | null;
  onClose: () => void;
}

/** Name and external id of a number; the number itself never changes. */
export function EditSipAccountModal({ account, onClose }: EditSipAccountModalProps) {
  return (
    <Modal opened={account !== null} onClose={onClose} title={`Edit ${account?.username ?? ''}`}>
      {/* Keyed by account so the fields start from that account's current values every time */}
      {account && <EditForm key={account.id} account={account} onClose={onClose} />}
    </Modal>
  );
}

function EditForm({ account, onClose }: { account: SipAccount; onClose: () => void }) {
  const [updateDetails, { isLoading, error }] = useUpdateSipAccountDetailsMutation();
  const [name, setName] = useState(account.name);
  const [externalId, setExternalId] = useState(account.external_id ?? '');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await updateDetails({
        id: account.id,
        name: name.trim(),
        external_id: externalId.trim() === '' ? null : externalId.trim(),
      }).unwrap();
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
          description="A label for the console and pushes, not a key"
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
          maxLength={128}
          required
          data-autofocus
        />
        <TextInput
          label="External id"
          description={`${externalIdHint[account.kind]} Changing it re-keys the number for the operator backend.`}
          value={externalId}
          onChange={(event) => setExternalId(event.currentTarget.value)}
          maxLength={128}
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
